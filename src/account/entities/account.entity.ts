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

  public comparePassword(password: string): Observable<any> {
    return from(bcrypt.compare(password, this.password));
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

  public getPublicAccountInfo(): IPublicAccount {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, recoveryKey, ...account } = this;
    return account;
  }

  public getAccountInfo(): IAccount {
    return this;
  }
}
