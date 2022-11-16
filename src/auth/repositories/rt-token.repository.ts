import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infraestructure/database';
import { catchError, from, map, Observable } from 'rxjs';
import { IRtToken, RtTokenEntity } from '../entities';

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

  findOne(params: Partial<RtTokenEntity>): Observable<RtTokenEntity | null> {
    return from(this.database.rtToken.findUnique({ where: params })).pipe(
      map((data) => (data ? new RtTokenEntity(data) : null)),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }
}
