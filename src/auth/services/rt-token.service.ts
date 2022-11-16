import { Injectable } from '@nestjs/common';
import { RtTokenRepository } from '../repositories';
import { Either, isLeft } from '../../shared/utility-types';
import { isEmptyString } from '../../shared/fns';
import { GenericError, IDefaultError } from '../../shared/errors';
import { catchError, map, Observable, of } from 'rxjs';
import { IRtToken, RtTokenEntity } from '../entities';
import { DEFAULT_REGISTER_STATUS } from 'src/shared/consts';

@Injectable()
export class RtTokenService {
  constructor(private repo: RtTokenRepository) {}

  create(
    rtTokenDto: Partial<IRtToken>,
    refreshToken: string,
  ): Observable<Either<IDefaultError, RtTokenEntity>> {
    const rtToken = new RtTokenEntity(rtTokenDto);
    rtToken.hashRt(refreshToken);
    rtToken.registerStatus = DEFAULT_REGISTER_STATUS.ACTIVE;

    return this.repo.create(rtToken).pipe(
      map((token) => {
        if (!token) throw new Error('Falha ao criar token de atualização');
        return { right: token };
      }),
      catchError((error) => {
        return of({ left: { message: error.message } });
      }),
    );
  }
}
