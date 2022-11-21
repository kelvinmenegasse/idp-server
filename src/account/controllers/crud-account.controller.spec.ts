import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ACCOUNT_REGISTER_STATUS } from '../../shared/consts';
import { CreateAccountDto, UpdateAccountDto } from '../dto';
import { AccountEntity } from '../entities';
import { mockAccount, mockAccountEntity } from '../mocks';
import { CrudAccountService } from '../services';
import { CrudAccountController } from './crud-account.controller';

describe('CrudAccountController', () => {
  let controller: CrudAccountController;
  let service: CrudAccountService;

  const mockCrudAccountService = {
    create: jest.fn().mockReturnValue(of({ right: mockAccountEntity })),
    getById: jest.fn().mockReturnValue(of({ right: mockAccountEntity })),
    update: jest.fn().mockReturnValue(of({ right: mockAccountEntity })),
    softDelete: jest.fn().mockReturnValue(
      of({
        right: Object.assign(mockAccountEntity, {
          registerStatus: ACCOUNT_REGISTER_STATUS.REMOVED,
          deletedAt: new Date().toUTCString(),
        } as AccountEntity),
      }),
    ),
    restore: jest.fn().mockReturnValue(
      of({
        right: Object.assign(mockAccountEntity, {
          registerStatus: ACCOUNT_REGISTER_STATUS.ACTIVE,
          deletedAt: null,
        } as AccountEntity),
      }),
    ),
    hardDelete: jest.fn().mockReturnValue(
      of({
        right: Object.assign(mockAccountEntity, {
          registerStatus: ACCOUNT_REGISTER_STATUS.ACTIVE,
          deletedAt: null,
        } as AccountEntity),
      }),
    ),
    getMany: jest.fn().mockReturnValue(of({ right: [mockAccountEntity] })),
    findOne: jest.fn().mockReturnValue(of({ right: mockAccountEntity })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrudAccountController],
      providers: [
        {
          provide: CrudAccountService,
          useValue: mockCrudAccountService,
        },
      ],
    }).compile();

    controller = module.get<CrudAccountController>(CrudAccountController);
    service = module.get<CrudAccountService>(CrudAccountService);
  });

  // * Reset the mock function calls after each test.
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create account', () => {
    it('should create and return a new account', (done) => {
      // * arrange
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // * remove id from mockAccount
      const { id, ...createAccountMock } = mockAccount;

      const createAccountDto: CreateAccountDto =
        Object.assign(createAccountMock);

      // * Act
      controller.create(createAccountDto).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('right');
          expect(result).toEqual({ right: mockAccountEntity });
          expect(mockCrudAccountService.create).toHaveBeenCalledTimes(1);
          expect(mockCrudAccountService.create).toHaveBeenCalledWith(
            createAccountDto,
          );
        },
        complete: () => done(),
      });
    });
  });

  describe('find account', () => {
    it('should return an account', (done) => {
      // * Arrange
      const accountId = 1;
      // * Act
      controller.getById(accountId).subscribe({
        next: (data) => {
          // * Assert
          expect(data).toHaveProperty('right');
          expect(data).toEqual({ right: mockAccountEntity });
          expect(mockCrudAccountService.getById).toHaveBeenCalledTimes(1);
          expect(mockCrudAccountService.getById).toHaveBeenCalledWith(
            accountId,
          );
        },
        complete: () => done(),
      });
    });
  });

  describe('get many accounts', () => {
    it('should return an array of accounts', (done) => {
      // * Arrange
      const registerStatusParam = {
        registerStatus: ACCOUNT_REGISTER_STATUS.ACTIVE,
      };
      // * Act
      controller.getAll(registerStatusParam).subscribe({
        next: (data) => {
          // * Assert
          expect(data).toHaveProperty('right');
          expect(data).toEqual({ right: [mockAccountEntity] });
          expect(mockCrudAccountService.getMany).toHaveBeenCalledTimes(1);
          expect(mockCrudAccountService.getMany).toHaveBeenCalledWith(
            registerStatusParam,
          );
        },
        complete: () => done(),
      });
    });
  });

  describe('get one account', () => {
    it('should return an account by param search', (done) => {
      // * Arrange
      const usernameParam = {
        username: mockAccount.username,
      };
      // * Act
      controller.getOne(usernameParam).subscribe({
        next: (data) => {
          // * Assert
          expect(data).toHaveProperty('right');
          expect(data).toEqual({ right: mockAccountEntity });
          expect(mockCrudAccountService.findOne).toHaveBeenCalledTimes(1);
          expect(mockCrudAccountService.findOne).toHaveBeenCalledWith(
            usernameParam,
          );
        },
        complete: () => done(),
      });
    });
  });

  describe('update account', () => {
    it('should update and return a account', (done) => {
      // * arrange
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // * remove id from mockAccount
      const { id, ...updateAccountMock } = mockAccount;

      const updateAccountDto: UpdateAccountDto =
        Object.assign(updateAccountMock);

      // * Act
      controller.update(id, updateAccountDto).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('right');
          expect(result).toEqual({ right: mockAccountEntity });
          expect(mockCrudAccountService.update).toHaveBeenCalledTimes(1);
          expect(mockCrudAccountService.update).toHaveBeenCalledWith(
            id,
            updateAccountDto,
          );
        },
        complete: () => done(),
      });
    });
  });

  describe('soft delete account', () => {
    it('should soft delete an account', (done) => {
      // * Arrange
      const accountId = 1;
      // * Act
      controller.softDelete(accountId).subscribe({
        next: (data) => {
          // * Assert
          const mockAccountEntitySoftDelete = Object.assign(mockAccountEntity, {
            registerStatus: ACCOUNT_REGISTER_STATUS.REMOVED,
            deletedAt: new Date().toISOString(),
          } as AccountEntity);
          expect(data).toHaveProperty('right');
          expect(data).toEqual({ right: mockAccountEntitySoftDelete });
          expect(mockCrudAccountService.softDelete).toHaveBeenCalledTimes(1);
          expect(mockCrudAccountService.softDelete).toHaveBeenCalledWith(
            accountId,
          );
        },
        complete: () => done(),
      });
    });
  });

  describe('restore account', () => {
    it('should restore an account', (done) => {
      // * Arrange
      const restoreAccountId = 1;
      // * Act
      controller.restore(restoreAccountId).subscribe({
        next: (data) => {
          // * Assert
          const mockAccountEntityRestore = Object.assign(mockAccountEntity, {
            registerStatus: ACCOUNT_REGISTER_STATUS.ACTIVE,
            deletedAt: null,
          } as AccountEntity);
          expect(data).toHaveProperty('right');
          expect(data).toEqual({ right: mockAccountEntityRestore });
          expect(mockCrudAccountService.restore).toHaveBeenCalledTimes(1);
          expect(mockCrudAccountService.restore).toHaveBeenCalledWith(
            restoreAccountId,
          );
        },
        complete: () => done(),
      });
    });
  });

  describe('delete account', () => {
    it('should delete an account', (done) => {
      // * Arrange
      const deleteAccountId = 1;
      // * Act
      controller.hardDelete(deleteAccountId).subscribe({
        next: (data) => {
          // * Assert
          const mockAccountEntityHardDelete = Object.assign(mockAccountEntity, {
            registerStatus: ACCOUNT_REGISTER_STATUS.ACTIVE,
            deletedAt: null,
          } as AccountEntity);
          expect(data).toHaveProperty('right');
          expect(data).toEqual({ right: mockAccountEntityHardDelete });
          expect(mockCrudAccountService.hardDelete).toHaveBeenCalledTimes(1);
          expect(mockCrudAccountService.hardDelete).toHaveBeenCalledWith(
            deleteAccountId,
          );
        },
        complete: () => done(),
      });
    });
  });
});
