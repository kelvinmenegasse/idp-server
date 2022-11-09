import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from '../../dto/create-account.dto';
import { AccountEntity } from '../../entities/account.entity';
import { AccountRepository } from '../../repositories';
import { ACCOUNT_REGISTER_STATUS } from '../../../shared/consts';
import {
  Either,
  getEither,
  isLeft,
} from '../../../shared/utility-types/either';
import {
  GenericError,
  IDefaultError,
  InvalidParametersError,
} from '../../../shared/errors';
import { CpfValidateAndFilter } from '../../../shared/common';
import {
  Observable,
  map,
  catchError,
  of,
  switchMap,
  merge,
  exhaustMap,
} from 'rxjs';
import {
  CreateAccountError,
  ExistsCpfError,
  ExistsUsernameOrCpfError,
  GetAccountError,
} from '../../errors';

@Injectable()
export class AccountService {
  constructor(private repo: AccountRepository) {}

  setupNewAccount(
    data: Partial<CreateAccountDto>,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    try {
      // * SETUP
      if (!data.name) throw new Error('O nome é obrigatório.');
      if (!data.password) throw new Error('A senha é obrigatória.');

      if (!data.username && !data.cpf)
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

  create(createAccountDto: Partial<CreateAccountDto>): Observable<any> {
    return this.setupNewAccount(createAccountDto).pipe(
      exhaustMap((setupNewAccountResult) => {
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
      exhaustMap((setupNewAccountResult) =>
        this.repo.create(setupNewAccountResult.right.getAccountInfo()).pipe(
          map((result) => ({ right: result })),
          catchError((_error) => of({ left: CreateAccountError })),
        ),
      ),
      catchError((error) => of({ left: error.message as string })),
    );
  }
}
