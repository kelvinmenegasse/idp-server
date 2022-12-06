import * as argon from 'argon2';
import { catchError, from, map, Observable, tap } from 'rxjs';
import { EntityM } from '../../shared/base';

export type IRtToken = {
  id?: number;
  accountId: number;
  hashedRt: string;
  exp: number | null;
  iat: number | null;
  aud: string | null;
  ip: string | null;
  platform: string | null;
  browserBrand: string | null;
  userAgent: string | null;
  registerStatus: string;
  lastUsedAt: Date | string | null;
  deletedAt: Date | string | null;
};

export class RtTokenEntity extends EntityM implements IRtToken {
  id?: number;
  accountId: number;
  hashedRt: string;
  exp: number | null;
  iat: number | null;
  aud: string | null;
  ip: string | null;
  platform: string | null;
  browserBrand: string | null;
  userAgent: string | null;
  registerStatus: string;
  lastUsedAt: Date | string | null;
  deletedAt: Date | string | null;

  constructor(init?: Partial<IRtToken | null>) {
    super();
    Object.assign(this, init);
  }

  public compareRt(rt: string): Observable<boolean> {
    return from(argon.verify(this.hashedRt, rt)).pipe(map((result) => result));
  }

  public hashRt(rt: string | null = null): Observable<RtTokenEntity> {
    this.hashedRt = rt ?? this.hashedRt;
    return from(argon.hash(this.hashedRt)).pipe(
      map((hashedRt) => {
        if (!hashedRt) return null;
        this.hashedRt = hashedRt;
        return this;
      }),
    );
  }
}
