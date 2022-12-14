import { IDefaultError } from '../../shared/errors';

export const CreateAccountError = {
  name: 'CreateAccountError',
  message: 'Erro: Não foi possível criar a conta',
} as IDefaultError;

export const GetAccountError = {
  name: 'GetAccountError',
  message: 'Erro: Não foi possível encontrar a conta',
} as IDefaultError;

export const UpdateAccountError = {
  name: 'ErrorUpdateAccount',
  message: 'Erro: Não foi possível atualizar a conta',
} as IDefaultError;

export const ExistsUsernameError = {
  name: 'ExistsUsernameError',
  message: 'Erro: Já existe uma conta com esse usuário',
} as IDefaultError;

export const ExistsCpfError = {
  name: 'ExistsCpfError',
  message: 'Erro: Já existe uma conta com esse CPF',
} as IDefaultError;

export const ExistsUsernameOrCpfError = {
  name: 'ExistsCpfError',
  message: 'Erro: Já existe uma conta com esse Usuário ou CPF',
} as IDefaultError;

export const SoftDeleteAccountError = {
  name: 'ErrorSoftDeleteAccount',
  message: 'Erro: Não foi possível remover a conta',
} as IDefaultError;

export const HardDeleteAccountError = {
  name: 'ErrorHardDeleteAccount',
  message: 'Erro: Não foi possível remover permanentemente a conta',
} as IDefaultError;

export const RestoreAccountError = {
  name: 'ErrorRestoreAccount',
  message: 'Erro: Não foi possível restaurar a conta',
} as IDefaultError;

export const CreateRecoveryKeyError = {
  name: 'ErrorCreateRecoveryKey',
  message: 'Erro: Não foi possível criar uma chave de recuperação para a conta',
} as IDefaultError;
