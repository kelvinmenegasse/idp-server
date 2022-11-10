import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from '../dto/create-account.dto';
import { AccountEntity } from '../entities/account.entity';
import { AccountRepository } from '../repositories';
import { ACCOUNT_REGISTER_STATUS } from '../../shared/consts';
import { Either, isLeft } from '../../shared/utility-types/either';
import { IDefaultError, InvalidParametersError } from '../../shared/errors';
import { CpfValidateAndFilter } from '../../shared/common';
import { Observable, map, catchError, of, concatMap } from 'rxjs';
import {
  CreateAccountError,
  ExistsCpfError,
  ExistsUsernameError,
  ExistsUsernameOrCpfError,
  GetAccountError,
  HardDeleteAccountError,
  RestoreAccountError,
  SoftDeleteAccountError,
  UpdateAccountError,
} from '../errors';
import { UpdateAccountDto } from 'src/account/dto';

@Injectable()
export class CrudAccountService {
  constructor(private repo: AccountRepository) {}

  setupNewAccount(
    data: Partial<CreateAccountDto>,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    try {
      // * SETUP
      if (!data.name || data.name.trim() === '')
        throw new Error('O nome é obrigatório.');
      if (!data.password || data.password.trim() === '')
        throw new Error('A senha é obrigatória.');

      if (
        (!data.username && !data.cpf) ||
        (data.username.trim() === '' && data.cpf.trim() === '')
      )
        throw new Error('O nome de usuário é obrigatório.');

      const account: AccountEntity = new AccountEntity(data);
      account.hashPassword();
      account.registerStatus = ACCOUNT_REGISTER_STATUS.ACTIVE;

      if (!!account.cpf) {
        const cpfValidation = CpfValidateAndFilter(account.cpf);
        // * CPF invalido
        if (cpfValidation.type !== 'success') {
          throw new Error(cpfValidation.message);
        }
        account.cpf = cpfValidation.data;
      }

      // * define username como cpf caso não seja informado
      account.username = account.username ?? account.cpf;

      return of({ right: account });
    } catch (error) {
      return of({
        left: { name: 'ACCOUNT_INVALID', message: error.message },
      });
    }
  }

  findOne(
    params: Partial<AccountEntity>,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    if (!params) of({ left: InvalidParametersError });

    return this.repo.findOne(params).pipe(
      map((account) => ({ right: account })),
      catchError((error) => {
        console.error(error);
        return of({ left: GetAccountError });
      }),
    );
  }

  getById(id: number): Observable<Either<IDefaultError, AccountEntity>> {
    return this.repo.getById(id).pipe(
      map((result) => ({ right: result })),
      catchError((_error) => of({ left: GetAccountError })),
    );
  }

  getMany(
    params: Partial<AccountEntity>,
  ): Observable<Either<IDefaultError, AccountEntity[]>> {
    return this.repo.getMany(params).pipe(
      map((result) => ({ right: result })),
      catchError((_error) => of({ left: GetAccountError })),
    );
  }

  findUsernameOrCpf(params: {
    username?: string;
    cpf?: string;
  }): Observable<Either<IDefaultError, AccountEntity>> {
    return this.repo
      .findUsernameOrCpf({ username: params.username, cpf: params.cpf })
      .pipe(
        map((account) => (account ? { right: account } : { right: null })),
        catchError((_error) => of({ left: GetAccountError })),
      );
  }

  create(
    createAccountDto: Partial<CreateAccountDto>,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    return this.setupNewAccount(createAccountDto).pipe(
      concatMap((setupNewAccountResult) => {
        if (isLeft(setupNewAccountResult))
          throw new Error(setupNewAccountResult.left.message as string);
        // * verify if username or cpf already exists
        return this.findUsernameOrCpf({
          username: setupNewAccountResult.right.username,
          cpf: setupNewAccountResult.right.cpf,
        }).pipe(
          map((res) => {
            if (isLeft(res)) throw new Error(res.left.message as string);
            if (res.right)
              throw new Error(ExistsUsernameOrCpfError.message as string);
            return setupNewAccountResult;
          }),
        );
      }),
      concatMap((setupNewAccountResult) =>
        this.repo.create(setupNewAccountResult.right.getAccountInfo()).pipe(
          map((result) => ({ right: result })),
          catchError((_error) => of({ left: CreateAccountError })),
        ),
      ),
      catchError((error) =>
        of({
          left: {
            message: error.message,
            name: CreateAccountError.name,
          },
        }),
      ),
    );
  }

  update(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    if (!id) return of({ left: InvalidParametersError });
    return this.repo.findOne({ id }).pipe(
      map((account) => {
        if (
          'name' in updateAccountDto &&
          (updateAccountDto.name.trim() === '' ||
            updateAccountDto.name === null)
        )
          throw new Error('Nome inválido.');
        if (!account) throw new Error('Conta não encontrada.');
        return account;
      }),
      concatMap((account) => {
        if (updateAccountDto.username) {
          return this.findUsernameOrCpf({
            username: updateAccountDto.username,
          }).pipe(
            map((res) => {
              if (isLeft(res)) throw new Error(res.left.message as string);
              if (res.right && res.right.id !== account.id)
                throw new Error(ExistsUsernameError.message as string);
              return account;
            }),
          );
        }
      }),
      concatMap((account) => {
        if (updateAccountDto.cpf) {
          const cpfValidation = CpfValidateAndFilter(updateAccountDto.cpf);
          // * CPF invalido
          if (cpfValidation.type !== 'success') {
            throw new Error(cpfValidation.message);
          }
          updateAccountDto.cpf = cpfValidation.data;
          return this.findUsernameOrCpf({
            cpf: updateAccountDto.cpf,
          }).pipe(
            map((res) => {
              if (isLeft(res)) throw new Error(res.left.message as string);
              if (res.right && res.right.id !== account.id)
                throw new Error(ExistsCpfError.message as string);
              return account;
            }),
          );
        }
      }),
      concatMap((account) => {
        return this.repo.update(account.id, updateAccountDto).pipe(
          map((result) => ({ right: result })),
          catchError((_error) => of({ left: UpdateAccountError })),
        );
      }),
      catchError((error) =>
        of({
          left: {
            message: error.message,
            name: UpdateAccountError.name,
          },
        }),
      ),
    );
  }

  softDelete(id: number): Observable<any> {
    if (!id) return of({ left: InvalidParametersError });
    return this.repo.softDelete(id).pipe(
      map((result) => ({ right: result })),
      catchError((_error) => of({ left: SoftDeleteAccountError })),
    );
  }

  restore(id: number): Observable<any> {
    if (!id) return of({ left: InvalidParametersError });
    return this.repo.restore(id).pipe(
      map((result) => ({ right: result })),
      catchError((_error) => of({ left: RestoreAccountError })),
    );
  }

  hardDelete(id: number): Observable<any> {
    if (!id) return of({ left: InvalidParametersError });
    return this.repo.hardDelete(id).pipe(
      map((result) => ({ right: result })),
      catchError((_error) => of({ left: HardDeleteAccountError })),
    );
  }
}
