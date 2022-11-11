import { Mapper } from '../../shared/base/mapper';
import { IAccount, AccountEntity } from '../entities';

export class AccountEntityMapper extends Mapper<
  Partial<IAccount>,
  AccountEntity
> {
  public mapFrom(
    data: Partial<IAccount>,
    getInfoSafely = false,
  ): AccountEntity | null {
    if (!data) return null; // * return null if data is null
    if (getInfoSafely) {
      delete data.password;
      delete data.recoveryKey;
    }
    const account = new AccountEntity(data);
    return account;
  }

  public mapTo(data: AccountEntity, getInfoSafely = false): Partial<IAccount> {
    return data.getAccountInfo({ getInfoSafely });
  }
}
