import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infraestructure/database';
import { AccountEntity, IAccount } from '../entities';
import { RepositoryM } from '../../shared/base';
import { ACCOUNT_REGISTER_STATUS } from '../../shared/consts';
import { catchError, from, map, Observable, concatMap, tap } from 'rxjs';
import { Account } from '@prisma/client';

@Injectable()
export class AccountRepository implements RepositoryM<AccountEntity> {
  constructor(private database: PrismaService) {}

  create(data: IAccount): Observable<AccountEntity> {
    return from(this.database.account.create({ data })).pipe(
      map((account) => (account ? new AccountEntity(account) : null)),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  findOne(params: Partial<AccountEntity>): Observable<AccountEntity> {
    return from(this.database.account.findUnique({ where: params })).pipe(
      map((account) => (account ? new AccountEntity(account) : null)),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  findUsernameOrCpf(params: {
    username: string;
    cpf: string;
  }): Observable<AccountEntity> {
    // * check if username or cpf already exists in database
    return from(
      this.database.account.findMany({
        where: {
          OR: [
            {
              username: params.username,
            },
            {
              cpf: params.cpf,
            },
          ],
        },
        take: 1,
      }),
    ).pipe(
      map((accounts: Account[]) =>
        accounts.length > 0 ? new AccountEntity(accounts[0]) : null,
      ),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  update(id: number, data: Partial<IAccount>): Observable<AccountEntity> {
    return from(
      this.database.account.update({
        where: { id },
        data,
      }),
    ).pipe(
      map((account) => (account ? new AccountEntity(account) : null)),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  getById(id: number): Observable<AccountEntity> {
    return from(this.database.account.findUnique({ where: { id } })).pipe(
      map((account) => (account ? new AccountEntity(account) : null)),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  getAll(): Observable<AccountEntity[]> {
    return from(this.database.account.findMany()).pipe(
      map((accounts) => accounts.map((account) => new AccountEntity(account))),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  getOne(filter: Partial<AccountEntity>): Observable<AccountEntity> {
    return from(this.database.account.findUnique({ where: filter })).pipe(
      map((account) => (account ? new AccountEntity(account) : null)),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  getMany(filter: Partial<AccountEntity>): Observable<AccountEntity[]> {
    return from(this.database.account.findMany({ where: filter })).pipe(
      map((accounts) => accounts.map((account) => new AccountEntity(account))),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  softDelete(id: number): Observable<AccountEntity> {
    return this.getById(id).pipe(
      concatMap((account: AccountEntity) => {
        account.registerStatus = ACCOUNT_REGISTER_STATUS.REMOVED;
        account.deletedAt = new Date();
        return this.update(id, account).pipe(
          map((account) => (account ? new AccountEntity(account) : null)),
          catchError((err) => {
            throw new Error(err);
          }),
        );
      }),
    );
  }

  restore(id: number): Observable<AccountEntity> {
    return this.getById(id).pipe(
      concatMap((account: AccountEntity) => {
        account.registerStatus = ACCOUNT_REGISTER_STATUS.ACTIVE;
        account.deletedAt = null;

        return this.update(id, account).pipe(
          map((account) => (account ? new AccountEntity(account) : null)),
          catchError((err) => {
            throw new Error(err);
          }),
        );
      }),
    );
  }

  hardDelete(id: number): Observable<AccountEntity> {
    return from(this.database.account.delete({ where: { id } })).pipe(
      map((account) => (account ? new AccountEntity(account) : null)),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }
}
