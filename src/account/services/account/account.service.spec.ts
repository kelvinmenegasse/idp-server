import { Test, TestingModule } from '@nestjs/testing';
import { AccountRepository } from '../../repositories';
import { mockAccount } from '../../mocks';
import { AccountService } from './account.service';
import { of } from 'rxjs';
import { AccountEntity } from '../../../account/entities';

describe('AccountService', () => {
  let service: AccountService;
  let repo: AccountRepository;

  let account = mockAccount;
  let accountEntity = new AccountEntity(account);

  const mockRepository = {
    create: jest.fn().mockReturnValue(of(account)),
    findOne: jest.fn().mockReturnValue(of(account)),
    findUsernameOrCpf: jest.fn().mockReturnValue(of(null)),
  };

  beforeEach(async () => {
    account = JSON.parse(JSON.stringify(mockAccount));
    accountEntity = new AccountEntity(account);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AccountRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    repo = module.get<AccountRepository>(AccountRepository);
  });

  // * Reset the mock function calls after each test.
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
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
      // * Act
      service.setupNewAccount(account).subscribe({
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

      // * Act
      service.setupNewAccount(account).subscribe({
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
      service.create(account).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('left');
        },
        complete: () => done(),
      });
    });

    it('should create an account', (done) => {
      // * Act
      service.create(account).subscribe({
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
      account = Object.assign(account, { name: null });

      // * Act
      service.create(account).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('left');
        },
        complete: () => done(),
      });
    });

    it('should not update an account', (done) => {
      // * Act
      service.create(account).subscribe({
        next: (result) => {
          // * Assert
          expect(result).toHaveProperty('right');
        },
        complete: () => done(),
      });
    });
  });
});
