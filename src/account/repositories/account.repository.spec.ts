import { Test, TestingModule } from '@nestjs/testing';
import { AccountRepository } from '../repositories';
import {
  mockAccount,
  mockAccountEntity,
  mockAccounts,
  mockAccountsEntities,
} from '../mocks';
import { AccountEntity, IAccount } from '../entities';
import { ACCOUNT_REGISTER_STATUS } from '../../shared/consts';
import { PrismaService } from '../../infraestructure/database/prisma/prisma.service';
import { lastValueFrom, of } from 'rxjs';

describe('AccountRepository', () => {
  let repo: AccountRepository;
  let prismaService: PrismaService;

  const prismaMock = {
    account: {
      create: jest.fn().mockReturnValue(of(mockAccountEntity)),
      findFirst: jest.fn().mockReturnValue(of(mockAccountEntity)),
      update: jest.fn().mockReturnValue(of(mockAccountEntity)),
      findMany: jest.fn().mockReturnValue(of(mockAccountsEntities)),
      delete: jest.fn().mockReturnValue(of(mockAccount)),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repo = module.get<AccountRepository>(AccountRepository);
    // * Get a reference to the module's `PrismaService` and save it for usage in our tests.
    prismaService = module.get<PrismaService>(PrismaService);
  });

  // * Reset the mock function calls after each test.
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('create', () => {
    test('should create an account', async () => {
      // * Setup
      const account: IAccount = mockAccount;
      // * Action
      // ? use `lastValueFrom` to get the last value emitted from the observable
      // ? `lastValueFrom` is an alternative to subscribe in the observable returned by the service
      const result = await lastValueFrom(repo.create(account));
      // * Verify
      expect(result).toEqual(mockAccountEntity);
      expect(prismaMock.account.create).toBeCalledTimes(1);
      expect(prismaMock.account.create).toBeCalledWith({ data: account });
    });
  });

  describe('findByUsername', () => {
    it('should find an account by username', (done) => {
      // * Setup
      const username = mockAccount.username;
      // * Action
      repo.findOne({ username }).subscribe({
        next: (result) => {
          // * Verify
          expect(result).toEqual(mockAccount);
          expect(prismaMock.account.findFirst).toBeCalledTimes(1);
          expect(prismaMock.account.findFirst).toBeCalledWith({
            where: { username },
          });
          expect(result).toMatchObject({ username });
        },
        complete: () => done(),
      });
    });
  });

  describe('update', () => {
    it('should update an account', (done) => {
      // * Setup
      const id = mockAccount.id;
      const account: AccountEntity = new AccountEntity(mockAccount);
      // * Action
      repo.update(id, account).subscribe({
        next: (result) => {
          // * Verify
          expect(result).toEqual(mockAccount);
          expect(prismaMock.account.update).toBeCalledTimes(1);
        },
        complete: () => done(),
      });
    });
  });

  describe('getById', () => {
    it('should get an account by id', (done) => {
      // * Setup
      const id = mockAccount.id;
      // * Action
      repo.getById(id).subscribe({
        next: (result) => {
          // * Verify
          expect(result).toEqual(mockAccount);
          expect(prismaMock.account.findFirst).toBeCalledTimes(1);
        },
        complete: () => done(),
      });
    });
  });

  describe('getAll', () => {
    it('should get all accounts', (done) => {
      // * Setup
      // * Action
      repo.getAll().subscribe({
        next: (result) => {
          // * Verify
          expect(result).toBeDefined();
          expect(prismaMock.account.findMany).toBeCalledTimes(1);
          expect(result).toEqual(mockAccounts);
        },
        complete: () => done(),
      });
    });
  });

  describe('getOne', () => {
    it('should get an account', (done) => {
      // * Setup
      const filter: Partial<AccountEntity> = { id: mockAccount.id };
      // * Action
      repo.getOne(filter).subscribe({
        next: (result) => {
          // * Verify
          expect(result).toEqual(mockAccount);
          expect(prismaMock.account.findFirst).toBeCalledTimes(1);
          expect(prismaMock.account.findFirst).toBeCalledWith({
            where: filter,
          });
        },
        complete: () => done(),
      });
    });
  });

  describe('getMany', () => {
    it('should get many accounts', (done) => {
      // * Setup
      const filter: Partial<AccountEntity> = { id: mockAccount.id };
      // * Action
      repo.getMany(filter).subscribe({
        next: (result) => {
          // * Verify
          expect(result).toBeDefined();
        },
        complete: () => done(),
      });
    });
  });

  describe('softDelete', () => {
    it('should soft delete an account', (done) => {
      // * Setup
      const id = mockAccount.id;
      // * Action
      repo.softDelete(id).subscribe({
        next: (result) => {
          // * Verify
          expect(result).toEqual(mockAccount);
          expect(prismaMock.account.update).toBeCalledTimes(1);
          expect(prismaMock.account.update).toBeCalledWith({
            where: { id },
            data: Object.assign(mockAccount, {
              deletedAt: expect.any(Date),
              registerStatus: ACCOUNT_REGISTER_STATUS.REMOVED,
            }),
          });
        },
        complete: () => done(),
      });
    });
  });

  describe('restore', () => {
    it('should restore an account', (done) => {
      // * Setup
      const id = mockAccount.id;
      // * Action
      repo.restore(id).subscribe({
        next: (result) => {
          // * Verify
          expect(
            Object.assign(mockAccount, {
              deletedAt: null,
              registerStatus: ACCOUNT_REGISTER_STATUS.ACTIVE,
            }),
          ).toEqual(mockAccount);
          expect(prismaMock.account.update).toBeCalledTimes(1);
          expect(prismaMock.account.update).toBeCalledWith({
            where: { id },
            data: Object.assign(mockAccount, {
              deletedAt: null,
              registerStatus: ACCOUNT_REGISTER_STATUS.ACTIVE,
            }),
          });
        },
        complete: () => done(),
      });
    });
  });

  describe('hardDelete', () => {
    it('should hard delete an account', (done) => {
      // * Setup
      const id = mockAccount.id;
      // * Action
      repo.hardDelete(id).subscribe({
        next: (result) => {
          // * Verify
          expect(result).toBeDefined();
          expect(result).toEqual(mockAccount);
          expect(prismaMock.account.delete).toBeCalledTimes(1);
          expect(prismaMock.account.delete).toBeCalledWith({ where: { id } });
        },
        complete: () => done(),
      });
    });
  });
});
