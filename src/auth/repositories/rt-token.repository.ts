import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infraestructure/database';
import { catchError, from, map, Observable } from 'rxjs';
import { IRtToken, RtTokenEntity } from '../entities';
import { DEFAULT_REGISTER_STATUS } from 'src/shared/consts';

@Injectable()
export class RtTokenRepository {
  constructor(private database: PrismaService) {}

  create(data: IRtToken): Observable<RtTokenEntity | null> {
    return from(this.database.rtToken.create({ data })).pipe(
      map((rtToken) => (rtToken ? new RtTokenEntity(rtToken) : null)),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  findOne(params: Partial<IRtToken>): Observable<RtTokenEntity | null> {
    return from(this.database.rtToken.findFirst({ where: params })).pipe(
      map((data) => (data ? new RtTokenEntity(data) : null)),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  findMany(params: Partial<IRtToken>): Observable<RtTokenEntity[] | null> {
    return from(this.database.rtToken.findMany({ where: params })).pipe(
      map((data) =>
        data.length > 0 ? data.map((row) => new RtTokenEntity(row)) : null,
      ),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  update(id: number, data: Partial<IRtToken>): Observable<RtTokenEntity> {
    return from(
      this.database.rtToken.update({
        where: { id },
        data,
      }),
    ).pipe(
      map((data) => (data ? new RtTokenEntity(data) : null)),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  softDelete(id: number): Observable<RtTokenEntity> {
    return from(
      this.database.rtToken.update({
        where: { id },
        data: {
          registerStatus: DEFAULT_REGISTER_STATUS.REMOVED,
        },
      }),
    ).pipe(
      map((data) => (data ? new RtTokenEntity(data) : null)),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }
}
