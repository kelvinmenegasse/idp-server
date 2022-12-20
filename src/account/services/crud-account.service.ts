import { Injectable } from '@nestjs/common';
import { CreateAccountDto, UpdateAccountDto } from '../dto';
import { AccountEntity, IAccount } from '../entities';
import { AccountEntityMapper } from '../mappers';
import { AccountRepository } from '../repositories';
import { ACCOUNT_REGISTER_STATUS } from '../../shared/consts';
import { Either, isLeft } from '../../shared/utility-types';
import { isEmptyString, randomStringGenerator } from '../../shared/common';
import { IDefaultError, InvalidParametersError } from '../../shared/errors';
import { CpfValidateAndFilter } from '../../shared/common';
import {
  Observable,
  map,
  catchError,
  of,
  concatMap,
  tap,
  forkJoin,
} from 'rxjs';
import * as bcrypt from 'bcrypt';
import {
  CreateAccountError,
  CreateRecoveryKeyError,
  ExistsCpfError,
  ExistsUsernameError,
  ExistsUsernameOrCpfError,
  GetAccountError,
  HardDeleteAccountError,
  RestoreAccountError,
  SoftDeleteAccountError,
  UpdateAccountError,
} from '../errors';
import { AccountMailService } from './account-mail.service';

@Injectable()
export class CrudAccountService {
  constructor(
    private repo: AccountRepository,
    private mailService: AccountMailService,
  ) {}

  setupNewAccount(
    data: Partial<CreateAccountDto>,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    try {
      // * VALIDATIONS
      if (isEmptyString(data.name)) throw new Error('O nome é obrigatório.');
      if (isEmptyString(data.password))
        throw new Error('A senha é obrigatória.');

      if (isEmptyString(data.username) && isEmptyString(data.cpf))
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

      // * SETUP
      account.name = account.name.trim();
      // * define username as cpf if username is empty
      account.username = account.username
        ? account.username.trim()
        : account.cpf;

      return of({ right: account });
    } catch (error) {
      return of({
        left: { name: 'ACCOUNT_INVALID', message: error.message },
      });
    }
  }

  findOne(
    queryParams: Partial<AccountEntity>,
    getInfoSafely = false,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    if (!queryParams) of({ left: InvalidParametersError });

    return this.repo.findOne(queryParams).pipe(
      map((result) => new AccountEntityMapper().mapFrom(result, getInfoSafely)),
      map((account) => ({ right: account })),
      catchError((error) => {
        console.error(error);
        return of({ left: GetAccountError });
      }),
    );
  }

  getById(
    id: number,
    getInfoSafely = false,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    return this.repo.getById(id).pipe(
      map((result) => new AccountEntityMapper().mapFrom(result, getInfoSafely)),
      map((account) => ({ right: account })),
      catchError((_error) => of({ left: GetAccountError })),
    );
  }

  getMany(
    queryParams: Partial<AccountEntity>,
    getInfoSafely = false,
  ): Observable<Either<IDefaultError, AccountEntity[]>> {
    return this.repo.getMany(queryParams).pipe(
      map((results) =>
        results.length > 0
          ? results.map((result) =>
              new AccountEntityMapper().mapFrom(result, getInfoSafely),
            )
          : null,
      ),
      map((result) => ({ right: result })),
      catchError((_error) => of({ left: GetAccountError })),
    );
  }

  findUsernameOrCpf(queryParams: {
    username?: string;
    cpf?: string;
    registerStatus?: string;
  }): Observable<Either<IDefaultError, AccountEntity>> {
    return this.repo
      .findUsernameOrCpf({
        username: queryParams.username,
        cpf: queryParams.cpf,
        registerStatus: queryParams.registerStatus,
      })
      .pipe(
        map((account) => (account ? { right: account } : { right: null })),
        catchError((_error) => of({ left: GetAccountError })),
      );
  }

  create(
    createAccountDto: Partial<CreateAccountDto>,
    getInfoSafely = false,
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
      concatMap((setupNewAccountResult) => {
        return this.repo
          .create(setupNewAccountResult.right.getAccountInfo() as IAccount)
          .pipe(
            map((result) =>
              new AccountEntityMapper().mapFrom(result, getInfoSafely),
            ),
            map((account) => ({ right: account })),
            catchError((_error) => of({ left: CreateAccountError })),
          );
      }),
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
    getInfoSafely = false,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    if (!id) return of({ left: InvalidParametersError });
    return this.repo.findOne({ id: Number(id) }).pipe(
      map((account) => {
        if (!account) throw new Error('Conta não encontrada.');
        if (
          'name' in updateAccountDto &&
          (updateAccountDto.name.trim() === '' ||
            updateAccountDto.name === null)
        )
          throw new Error('Nome inválido.');
        return account;
      }),
      concatMap((account) => {
        if (!updateAccountDto.username) return of(account);
        return this.findUsernameOrCpf({
          username: updateAccountDto.username,
        }).pipe(
          map((res) => {
            if (isLeft(res)) throw new Error(res.left.message as string);
            if (res.right && Number(res.right.id) !== Number(account.id))
              throw new Error(ExistsUsernameError.message as string);
            return account;
          }),
        );
      }),
      concatMap((account) => {
        if (!updateAccountDto.cpf) return of(account);
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
      }),
      concatMap((account) => {
        return this.repo.update(account.id, updateAccountDto).pipe(
          map((result) =>
            new AccountEntityMapper().mapFrom(result, getInfoSafely),
          ),
          map((account) => ({ right: account })),
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

  sendRecoveryKeyToAccounts(
    ids: number[],
  ): Observable<Either<IDefaultError, any>> {
    if (!ids || ids.length === 0) return of({ left: InvalidParametersError });

    return forkJoin(ids.map((id) => this.sendRecoveryKeyToAccount(id))).pipe(
      map((result) => {
        const errors: Either<IDefaultError, any>[] = result.filter((res) =>
          isLeft(res),
        );

        if (errors.length >= ids.length) {
          // * merge all message errors into one, separated by dot and space
          const errorString = errors.reduce(
            (acc, error) => acc + error.left.message + '. ',
            '',
          );

          throw new Error(
            'Não foi possível gerar a chave de recuperação para uma ou mais contas. Erro: ' +
              errorString,
          );
        }
        return result;
      }),
      map((result) => ({ right: result })),
      catchError((error) => {
        console.error(error);
        return of({
          left: {
            message: error.message,
          } as IDefaultError,
        });
      }),
    );
  }

  sendRecoveryKeyToAccount(id: number) {
    if (!id) return of({ left: InvalidParametersError });

    return this.createRecoveryKey(id).pipe(
      concatMap((createRecoveryKeyResult) => {
        if (isLeft(createRecoveryKeyResult)) {
          throw new Error(createRecoveryKeyResult.left.message as string);
        }
        if (!createRecoveryKeyResult.right.account.email) {
          throw new Error('Email não encontrado.');
        }
        return this.mailService.sendRecoveryKey(createRecoveryKeyResult.right);
      }),
      map((result) => ({ right: result })),
      catchError((error) => {
        console.error(error);
        return of({
          left: {
            message: error.message,
          } as IDefaultError,
        });
      }),
    );
  }

  createRecoveryKey(
    id: number,
  ): Observable<
    Either<IDefaultError, { account: AccountEntity; recoveryKey: string }>
  > {
    if (!id) return of({ left: InvalidParametersError });

    const recoveryKey = randomStringGenerator();

    return this.getById(id).pipe(
      concatMap((res) => {
        if (isLeft(res)) throw new Error(res.left.message as string);
        return this.repo
          .update(id, {
            recoveryKey: bcrypt.hashSync(recoveryKey, 10),
            recoveryKeyExpiration: new Date(),
          })
          .pipe(
            map((result) => new AccountEntityMapper().mapFrom(result, false)),
            map((account) => ({ right: { account, recoveryKey } })),
            catchError((error) => {
              console.error(error);
              return of({ left: CreateRecoveryKeyError });
            }),
          );
      }),
    );
  }

  softDelete(
    id: number,
    getInfoSafely = false,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    if (!id) return of({ left: InvalidParametersError });
    return this.repo.softDelete(id).pipe(
      map((result) => new AccountEntityMapper().mapFrom(result, getInfoSafely)),
      map((account) => ({ right: account })),
      catchError((_error) => of({ left: SoftDeleteAccountError })),
    );
  }

  restore(
    id: number,
    getInfoSafely = false,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    if (!id) return of({ left: InvalidParametersError });
    return this.repo.restore(id).pipe(
      map((result) => new AccountEntityMapper().mapFrom(result, getInfoSafely)),
      map((account) => ({ right: account })),
      catchError((_error) => of({ left: RestoreAccountError })),
    );
  }

  hardDelete(
    id: number,
    getInfoSafely = false,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    if (!id) return of({ left: InvalidParametersError });
    return this.repo.hardDelete(id).pipe(
      map((result) => new AccountEntityMapper().mapFrom(result, getInfoSafely)),
      map((account) => ({ right: account })),
      catchError((_error) => of({ left: HardDeleteAccountError })),
    );
  }
}
