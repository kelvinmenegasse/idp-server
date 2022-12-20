import { Test, TestingModule } from '@nestjs/testing';
import { AccountRepository } from '../repositories';
import { mockAccount, mockAccounts } from '../mocks';
import { CrudAccountService } from './crud-account.service';
import { of } from 'rxjs';
import { AccountEntity } from '../entities';
import { ACCOUNT_REGISTER_STATUS } from 'src/shared/consts';
import { CreateAccountDto } from '../dto';
import * as cpfUtilModule from '../../shared/common/cpf.util';
import { AccountMailService } from './account-mail.service';

describe('CrudAccountService', () => {
  // * MOCKS
  let service: CrudAccountService;
  let repo: AccountRepository;
  let accountMailService: AccountMailService;

  // * spy on CpfValidateAndFilter
  const mockCpfValidateAndFilter = jest.spyOn(
    cpfUtilModule,
    'CpfValidateAndFilter',
  );

  let account = mockAccount;
  let accountEntity = new AccountEntity(account);
  let accounts = mockAccounts;
  let accountEntities = mockAccounts.map(
    (account) => new AccountEntity(account),
  );

  const mockRepository = {
    create: jest.fn().mockReturnValue(of(account)),
    findOne: jest.fn().mockReturnValue(of(account)),
    findUsernameOrCpf: jest.fn().mockReturnValue(of(null)),
    update: jest.fn().mockReturnValue(of(account)),
    getById: jest.fn().mockReturnValue(of(account)),
    getAll: jest.fn().mockReturnValue(of(accounts)),
    getOne: jest.fn().mockReturnValue(of(account)),
    getMany: jest.fn().mockReturnValue(of(accounts)),
    softDelete: jest.fn().mockReturnValue(
      of(
        Object.assign(account, {
          registerStatus: ACCOUNT_REGISTER_STATUS.REMOVED,
          deletedAt: new Date().toUTCString(),
        } as AccountEntity),
      ),
    ),
    restore: jest.fn().mockReturnValue(
      of(
        Object.assign(account, {
          registerStatus: ACCOUNT_REGISTER_STATUS.ACTIVE,
          deletedAt: null,
        } as AccountEntity),
      ),
    ),
    hardDelete: jest.fn().mockReturnValue(of(true)),
  };

  const mockAccountMailService = {
    sendRecoveryKey: jest.fn().mockReturnValue(of(true)),
  };

  beforeEach(async () => {
    account = JSON.parse(JSON.stringify(mockAccount));
    accountEntity = new AccountEntity(account);
    accounts = mockAccounts;
    accountEntities = mockAccounts.map((account) => new AccountEntity(account));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrudAccountService,
        {
          provide: AccountRepository,
          useValue: mockRepository,
        },
        {
          provide: AccountMailService,
          useValue: mockAccountMailService,
        },
      ],
    }).compile();

    service = module.get<CrudAccountService>(CrudAccountService);
    repo = module.get<AccountRepository>(AccountRepository);
    accountMailService = module.get<AccountMailService>(AccountMailService);
  });

  // * Reset the mock function calls after each test.
  afterEach(() => {
    jest.clearAllMocks();

    // * mock the return value from CpfValidateAndFilter
    mockCpfValidateAndFilter.mockReturnValue({
      type: 'success',
      data: account.cpf,
      message: 'CPF válido',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
    expect(accountMailService).toBeDefined();
  });

  describe('find account', () => {
    it('should return an account', (done) => {
      // * Act
      service.findOne({ id: account.id }).subscribe({
        next: (data) => {
          // * Assert
          expect(data).toEqual({ right: account });
          expect(repo.findOne).toHaveBeenCalledTimes(1);
        },
        complete: () => done(),
      });
    });
  });
  describe('setup new account', () => {
    it('should return a new account', (done) => {
      // * Arrange

      // * Act
      service.setupNewAccount(account as CreateAccountDto).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('right');
        },
        complete: () => done(),
      });
    });

    it('should return an invalid result', (done) => {
      // * Arrange
      account = Object.assign(account, { cpf: '00000000000' });

      // * mock the return value from CpfValidateAndFilter
      mockCpfValidateAndFilter.mockReturnValue({
        type: 'cpfInvalid',
        data: account.cpf,
        message: 'CPF inválido',
      });

      // * Act
      service.setupNewAccount(account as CreateAccountDto).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('left');
        },
        complete: () => done(),
      });
    });
  });

  describe('create', () => {
    it('should not create an account', (done) => {
      // * Arrange
      account = Object.assign(account, { name: null });

      // * Act
      service.create(account as CreateAccountDto).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('left');
        },
        complete: () => done(),
      });
    });

    it('should create an account', (done) => {
      // * Act
      service.create(account as CreateAccountDto).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('right');
        },
        complete: () => done(),
      });
    });
  });

  describe('update', () => {
    it('should update an account', (done) => {
      // * Arrange
      account = { ...account, name: 'New Name' };
      // * Act
      service.update(account.id as number, account).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('right');
        },
        complete: () => done(),
      });
    });

    it('should not update an account', (done) => {
      // * Arrange
      account = { ...account, name: '    ' };
      // * Act
      service.update(account.id as number, account).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('left');
        },
        complete: () => done(),
      });
    });
  });

  describe('softDelete', () => {
    it('should soft delete an account', (done) => {
      // * Arrange
      const softDeleteId: number = account.id as number;
      // * Act
      service.softDelete(softDeleteId).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('right');
        },
        complete: () => done(),
      });
    });

    it('should not soft delete an account', (done) => {
      // * Arrange
      const softDeleteId = null;
      // * Act
      service.softDelete(softDeleteId).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('left');
        },
        complete: () => done(),
      });
    });
  });

  describe('restore', () => {
    it('should restore an account', (done) => {
      // * Arrange
      const restoreId: number = account.id as number;
      // * Act
      service.restore(restoreId).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('right');
        },
        complete: () => done(),
      });
    });

    it('should not restore an account', (done) => {
      // * Arrange
      const restoreId = null;
      // * Act
      service.restore(restoreId).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('left');
        },
        complete: () => done(),
      });
    });
  });

  describe('hard delete', () => {
    it('should delete permanently an account', (done) => {
      // * Arrange
      const hardDeleteId: number = account.id as number;
      // * Act
      service.hardDelete(hardDeleteId).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('right');
        },
        complete: () => done(),
      });
    });

    it('should not restore an account', (done) => {
      // * Arrange
      const hardDeleteId = null;
      // * Act
      service.hardDelete(hardDeleteId).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('left');
        },
        complete: () => done(),
      });
    });
  });
});
