import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Tokens } from '../types';
import { CrudAccountService } from 'src/account/services';
import { RtTokenService } from '../services';
import { SigninDto, SignupDto } from '../dto';
import * as bcrypt from 'bcrypt';
import { catchError, concatMap, map, Observable, of, zip } from 'rxjs';
import { Either, isLeft } from 'src/shared/utility-types';
import { IDefaultError } from 'src/shared/errors';
import { concat } from 'rxjs/operators';
import { GetAccountError } from 'src/account/errors';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private accountService: CrudAccountService,
    private rtTokenService: RtTokenService,
  ) {}

  signupLocal(signupDto: SignupDto): Observable<Either<IDefaultError, Tokens>> {
    return this.accountService.create(signupDto).pipe(
      map((result) => {
        if (isLeft(result)) throw new Error('Falha ao criar conta');
        return result.right;
      }),
      concatMap((account) =>
        this.getTokens(account.id, account.username).pipe(
          map((resultTokens) => {
            if (isLeft(resultTokens)) throw new Error('Falha ao criar tokens');
            return { account: account, tokens: resultTokens.right };
          }),
        ),
      ),
      concatMap((result) => {
        return this.rtTokenService
          .create({ accountId: result.account.id }, result.tokens.refresh_token)
          .pipe(
            map((resultRtToken) => {
              if (isLeft(resultRtToken))
                throw new Error('Falha ao criar tokens');
              return { right: result.tokens };
            }),
          );
      }),
      catchError((err) => {
        return of({ left: { message: err.message } });
      }),
    );
  }

  signinLocal(signinDto: SigninDto): Observable<Either<IDefaultError, Tokens>> {
    return this.accountService
      .findUsernameOrCpf({
        username: signinDto.username,
        cpf: signinDto.username,
      })
      .pipe(
        map((result) => {
          if (isLeft(result))
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
                throw new Error('Falha ao criar tokens');
              return { account: account, tokens: resultTokens.right };
            }),
          ),
        ),
        concatMap((result) => {
          return this.rtTokenService
            .create(
              { accountId: result.account.id },
              result.tokens.refresh_token,
            )
            .pipe(
              map((resultRtToken) => {
                if (isLeft(resultRtToken))
                  throw new Error('Falha ao criar tokens');
                return { right: result.tokens };
              }),
            );
        }),
        catchError((err) => {
          return of({ left: { message: err.message } });
        }),
      );
  }

  // todo
  /* 
  async logout(accountId: number): Promise<boolean> {
    await this.prisma.account.updateMany({
      where: {
        id: accountId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
    return true;
  } 
  */
  /* 
  async refreshTokens(accountId: number, rt: string): Promise<Tokens> {
    const account = await this.prisma.account.findUnique({
      where: {
        id: accountId,
      },
    });
    if (!account || !account.hashedRt)
      throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(account.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(account.id, account.username);
    await this.updateRtHash(account.id, tokens.refresh_token);

    return tokens;
  }
 */

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
