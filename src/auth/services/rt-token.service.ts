import { Injectable } from '@nestjs/common';
import { RtTokenRepository } from '../repositories';
import { Either, isLeft } from '../../shared/utility-types';
import { isEmptyString } from '../../shared/common';
import {
  GenericError,
  IDefaultError,
  InvalidParametersError,
} from '../../shared/errors';
import { catchError, concatMap, map, Observable, of, take } from 'rxjs';
import { IRtToken, RtTokenEntity } from '../entities';
import { DEFAULT_REGISTER_STATUS } from 'src/shared/consts';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/shared/types';

@Injectable()
export class RtTokenService {
  constructor(
    private repo: RtTokenRepository,
    private jwtService: JwtService,
  ) {}

  create(
    rtTokenDto: Partial<IRtToken>,
    refreshToken: string,
  ): Observable<Either<IDefaultError, RtTokenEntity>> {
    const rtToken = new RtTokenEntity(rtTokenDto);
    return rtToken.hashRt(refreshToken).pipe(
      map((newRtToken) => {
        if (!newRtToken) throw new Error('Erro ao gerar token');
        return newRtToken;
      }),
      map((newRtToken: RtTokenEntity) => {
        const rtTokenDecoded: JwtPayload = this.jwtService.decode(
          refreshToken,
        ) as JwtPayload;

        newRtToken.exp = rtTokenDecoded.exp;
        newRtToken.iat = rtTokenDecoded.iat;

        newRtToken.lastUsedAt = new Date().toISOString();
        newRtToken.registerStatus = DEFAULT_REGISTER_STATUS.ACTIVE;
        return newRtToken;
      }),
      concatMap((newRtToken) => {
        return this.repo.create(newRtToken).pipe(
          map((token) => {
            if (!token) throw new Error('Falha ao criar token de atualização');
            return { right: token };
          }),
          catchError((error) => {
            return of({ left: { message: error.message } });
          }),
        );
      }),
      catchError((error) => of({ left: { message: error.message } })),
    );
  }

  getRtTokenByParams(params: {
    id?: number;
    accountId?: number;
    exp?: number;
    iat?: number;
    aud?: string;
    ip?: string;
    platform?: string;
    browserBrand?: string;
    userAgent?: string;
    registerStatus?: string;
    lastUsedAt?: string;
    deletedAt?: string;
  }): Observable<Either<IDefaultError, RtTokenEntity[]>> {
    return this.repo.findMany(params).pipe(
      map((result) => {
        return { right: result };
      }),
      catchError((error) => {
        return of({ left: { message: error.message } });
      }),
    );
  }

  softDelete(id: number): Observable<Either<IDefaultError, RtTokenEntity>> {
    if (!id) return of({ left: InvalidParametersError });
    return this.repo.softDelete(id).pipe(
      map((result) => new RtTokenEntity(result)),
      map((rtToken) => ({ right: rtToken })),
      catchError((_error) =>
        of({ left: { message: 'Não foi possível remover o Token' } }),
      ),
    );
  }
}
