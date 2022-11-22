import * as bcrypt from 'bcrypt';
import { from, Observable, of } from 'rxjs';
import { EntityM } from '../../shared/base';

export type IAccount = {
  id?: number;
  name: string;
  email?: string | null;
  cpf?: string | null;
  username: string;
  password: string;
  recoveryKey?: string | null;
  registerStatus: string;
  createdAt?: Date | string;
  updatedAt?: Date | string | null;
  deletedAt?: Date | string | null;
};

export type IPublicAccount = Omit<IAccount, 'password' | 'recoveryKey'>;

export class AccountEntity extends EntityM implements IAccount {
  id: number;
  name: string;
  email: string | null;
  cpf: string | null;
  username: string;
  password: string;
  recoveryKey: string | null;
  registerStatus: string;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  deletedAt: Date | string | null;

  constructor(init?: Partial<IAccount | null>) {
    super();
    Object.assign(this, init);
  }

  public hashPassword(password: string = null): void {
    this.password = password ?? this.password;
    this.password = bcrypt.hashSync(this.password, 10);
  }

  public comparePassword(password: string): any {
    return bcrypt.compareSync(password, this.password);
  }

  public generateRecoveryKey(length = 15): Observable<string> {
    let key = '';

    const characteres =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < length; i++) {
      key += characteres.charAt(Math.floor(Math.random() * characteres.length));
    }

    this.recoveryKey = bcrypt.hashSync(key, 10);

    return of(key);
  }

  // * getInfoSafely is a flag to return a public version of the account
  public getAccountInfo(
    params: { getInfoSafely: boolean } = null,
  ): IAccount | IPublicAccount {
    if (params) {
      if (params.getInfoSafely) {
        const { password, recoveryKey, ...account } = this;
        return account;
      }
    }
    return this;
  }
}
