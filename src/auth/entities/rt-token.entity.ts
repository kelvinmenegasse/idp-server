import * as bcrypt from 'bcrypt';
import { from, Observable, of } from 'rxjs';
import { EntityM } from '../../shared/base';

export type IRtToken = {
  id?: number;
  accountId: number;
  hashedRt: string;
  exp: Date | string | null;
  iat: Date | string | null;
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
  exp: Date | string | null;
  iat: Date | string | null;
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

  public compareRt(rt: string): Observable<any> {
    return from(bcrypt.compare(rt, this.hashedRt));
  }

  public hashRt(rt: string | null = null): void {
    this.hashedRt = rt ?? this.hashedRt;
    this.hashedRt = bcrypt.hashSync(this.hashedRt, 10);
  }
}
