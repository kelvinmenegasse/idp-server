import { ACCOUNT_REGISTER_STATUS } from '../../shared/consts';
import { AccountEntity, IAccount } from '../entities';

export const mockAccount: IAccount = {
  id: 1,
  name: 'Administrator',
  email: 'admin@admin.com',
  cpf: '987.654.321-00',
  username: 'admin.admin',
  password: '12345678',
  registerStatus: ACCOUNT_REGISTER_STATUS.ACTIVE,
  createdAt: new Date().toUTCString(),
  updatedAt: null,
  deletedAt: null,
  recoveryKey: null,
  recoveryKeyExpiration: null,
};

export const mockAccounts: IAccount[] = [mockAccount];

export const mockAccountEntity: AccountEntity = new AccountEntity(mockAccount);

export const mockAccountsEntities: AccountEntity[] = mockAccounts.map(
  (account) => new AccountEntity(account),
);
