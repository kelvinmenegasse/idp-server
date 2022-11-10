import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { CreateAccountDto } from '../dto';
import { mockAccount, mockAccountEntity } from '../mocks';
import { CrudAccountService } from '../services';
import { CrudAccountController } from './crud-account.controller';

describe('CrudAccountController', () => {
  let controller: CrudAccountController;
  let service: CrudAccountService;

  const mockCrudAccountService = {
    create: jest.fn().mockReturnValue(of({ right: mockAccountEntity })),
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
          expect(mockCrudAccountService.create).toHaveBeenCalledTimes(1);
          expect(mockCrudAccountService.create).toHaveBeenCalledWith(
            createAccountDto,
          );
        },
        complete: () => done(),
      });
    });
  });

  /* 
  describe('find account', () => {
    it('should return an account', (done) => {
      // * Act
      controller.findOne({ id: '1' }).subscribe({
        next: (data) => {
          // * Assert
          expect(data).toEqual({ right: 'account' });
        },
        complete: () => done(),
      });
    });
  }); */
});
