import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, JwtPayloadWithRt, Tokens } from 'src/shared/types';
import { CrudAccountService } from 'src/account/services';
import { RtTokenService } from '../services';
import { SigninDto, SignupDto } from '../dto';
import * as bcrypt from 'bcrypt';
import { catchError, concatMap, map, Observable, of, zip } from 'rxjs';
import { Either, isLeft } from 'src/shared/utility-types';
import { IDefaultError } from 'src/shared/errors';
import { GetAccountError } from 'src/account/errors';
import { RequestClientInfo } from 'src/shared/types';
import { DEFAULT_REGISTER_STATUS } from 'src/shared/consts';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private accountService: CrudAccountService,
    private rtTokenService: RtTokenService,
  ) {}

  signupLocal(
    signupDto: SignupDto,
    clientInfo?: RequestClientInfo,
  ): Observable<Either<IDefaultError, Tokens>> {
    return this.accountService.create(signupDto).pipe(
      map((result) => {
        if (isLeft(result)) throw new Error(result.left.message as string);
        return result.right;
      }),
      concatMap((account) =>
        this.getTokens(account.id, account.username).pipe(
          map((resultTokens) => {
            if (isLeft(resultTokens))
              throw new Error(resultTokens.left.message as string);
            return { account: account, tokens: resultTokens.right };
          }),
        ),
      ),
      concatMap((result) => {
        return this.rtTokenService
          .create(
            {
              accountId: result.account.id,
              browserBrand: clientInfo?.browserBrand,
              ip: clientInfo?.ip,
              platform: clientInfo?.platform,
              userAgent: clientInfo?.userAgent,
            },
            result.tokens.refresh_token,
          )
          .pipe(
            map((resultRtToken) => {
              if (isLeft(resultRtToken))
                throw new Error(resultRtToken.left.message as string);
              return { right: result.tokens };
            }),
          );
      }),
      catchError((err) => {
        return of({ left: { message: err.message } });
      }),
    );
  }

  signinLocal(
    signinDto: SigninDto,
    clientInfo?: RequestClientInfo,
  ): Observable<Either<IDefaultError, Tokens>> {
    return this.accountService
      .findUsernameOrCpf({
        username: signinDto.username,
        cpf: signinDto.username,
        registerStatus: DEFAULT_REGISTER_STATUS.ACTIVE,
      })
      .pipe(
        map((result) => {
          if (isLeft(result) || !result.right)
            throw new Error(GetAccountError.message as string);
          if (!result.right.comparePassword(signinDto.password)) {
            throw new Error('Senha incorreta');
          }
          return result.right;
        }),
        concatMap((account) =>
          this.getTokens(account.id, account.username).pipe(
            map((resultTokens) => {
              if (isLeft(resultTokens))
                throw new Error(resultTokens.left.message as string);
              return { account: account, tokens: resultTokens.right };
            }),
          ),
        ),
        concatMap((result) => {
          return this.rtTokenService
            .create(
              {
                accountId: result.account.id,
                browserBrand: clientInfo?.browserBrand,
                ip: clientInfo?.ip,
                platform: clientInfo?.platform,
                userAgent: clientInfo?.userAgent,
              },
              result.tokens.refresh_token,
            )
            .pipe(
              map((resultRtToken) => {
                if (isLeft(resultRtToken))
                  throw new Error(resultRtToken.left.message as string);
                return { right: result.tokens };
              }),
            );
        }),
        catchError((err) => {
          console.error(err);
          return of({ left: { message: err.message } });
        }),
      );
  }

  logout(
    jwtPayloadWithRt: JwtPayloadWithRt,
  ): Observable<Either<IDefaultError, boolean>> {
    return this.rtTokenService
      .getRtTokenByParams({
        accountId: jwtPayloadWithRt.sub,
        exp: jwtPayloadWithRt.exp,
        iat: jwtPayloadWithRt.iat,
        aud: jwtPayloadWithRt.aud,
        registerStatus: DEFAULT_REGISTER_STATUS.ACTIVE,
      })
      .pipe(
        map((result) => {
          if (isLeft(result) || !result.right)
            throw new Error('Token não encontrado');
          return result.right;
        }),
        concatMap((rtTokens) => {
          const rtTokenMatched = rtTokens.find((rtToken) =>
            rtToken.compareRt(jwtPayloadWithRt.refreshToken).pipe(
              map((result) => result),
              catchError((err) => of(false)),
            ),
          );
          if (!rtTokenMatched) throw new Error('Token não encontrado');
          return this.rtTokenService.softDelete(rtTokenMatched.id).pipe(
            map((result) => {
              if (isLeft(result))
                throw new Error(result.left.message as string);
              return { right: true };
            }),
          );
        }),
        catchError((err) => of({ left: { message: err.message } })),
      );
  }

  refreshTokens(
    jwtPayloadWithRt: JwtPayloadWithRt,
    clientInfo: RequestClientInfo,
  ): Observable<Either<IDefaultError, Tokens>> {
    return this.accountService
      .findOne({
        id: jwtPayloadWithRt.sub,
        registerStatus: DEFAULT_REGISTER_STATUS.ACTIVE,
      })
      .pipe(
        map((accountResult) => {
          if (isLeft(accountResult) || !accountResult.right)
            throw new Error('Conta não encontrada ou inativa');
          return accountResult.right;
        }),
        concatMap((account) => {
          return this.rtTokenService
            .getRtTokenByParams({
              accountId: jwtPayloadWithRt.sub,
              exp: jwtPayloadWithRt.exp,
              iat: jwtPayloadWithRt.iat,
              aud: jwtPayloadWithRt.aud,
              registerStatus: DEFAULT_REGISTER_STATUS.ACTIVE,
            })
            .pipe(
              map((result) => {
                if (isLeft(result) || !result.right)
                  throw new Error('Token não encontrado');
                return result.right;
              }),
            );
        }),
        concatMap((rtTokens) => {
          const rtTokenMatched = rtTokens.find((rtToken) =>
            rtToken
              .compareRt(jwtPayloadWithRt.refreshToken)
              .pipe(map((result) => result)),
          );
          if (!rtTokenMatched) throw new Error('Token não encontrado');
          return this.rtTokenService.softDelete(rtTokenMatched.id).pipe(
            map((result) => {
              if (isLeft(result))
                throw new Error(result.left.message as string);
              return { right: true };
            }),
          );
        }),
        concatMap((softDeleteResult) => {
          return this.getTokens(
            jwtPayloadWithRt.sub,
            jwtPayloadWithRt.username,
          ).pipe(
            map((resultTokens) => {
              if (isLeft(resultTokens))
                throw new Error(resultTokens.left.message as string);
              return { tokens: resultTokens.right };
            }),
          );
        }),
        concatMap((result) => {
          return this.rtTokenService
            .create(
              {
                accountId: jwtPayloadWithRt.sub,
                browserBrand: clientInfo.browserBrand,
                ip: clientInfo?.ip,
                platform: clientInfo?.platform,
                userAgent: clientInfo?.userAgent,
              },
              result.tokens.refresh_token,
            )
            .pipe(
              map((resultRtToken) => {
                if (isLeft(resultRtToken))
                  throw new Error(resultRtToken.left.message as string);
                return { right: result.tokens };
              }),
            );
        }),
        catchError((err) => {
          console.error(err);
          return of({ left: { message: err.message } });
        }),
      );
  }

  getTokens(
    accountId: number,
    username: string,
  ): Observable<Either<IDefaultError, Tokens>> {
    const jwtPayload: Partial<JwtPayload> = {
      sub: accountId,
      username: username,
      iss: this.config.get<string>('APP_DOMAIN'),
    };

    const atPromise = this.jwtService.signAsync(jwtPayload, {
      secret: this.config.get<string>('JWT_AT_SECRET'),
      expiresIn: this.config.get<string>('JWT_AT_EXPIRATION_TIME'),
    });

    const rtPromise = this.jwtService.signAsync(jwtPayload, {
      secret: this.config.get<string>('JWT_RT_SECRET'),
      expiresIn: this.config.get<string>('JWT_RT_EXPIRATION_TIME'),
    });

    return zip(atPromise, rtPromise).pipe(
      map((tokens) => {
        return { right: { access_token: tokens[0], refresh_token: tokens[1] } };
      }),
      catchError((err) => {
        return of({ left: { message: err.message } });
      }),
    );
  }
}
