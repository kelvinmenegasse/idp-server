import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { PrismaService } from '../../infraestructure/database/prisma/prisma.service';
import { DEFAULT_REGISTER_STATUS } from '../../shared/consts';
import { RtTokenEntity } from '../entities';
import { RtTokenRepository } from './rt-token.repository';

describe('RtTokenRepository', () => {
  let repo: RtTokenRepository;
  let database: PrismaService;

  const mockRtTokenEntity: RtTokenEntity = new RtTokenEntity({
    id: 1,
    accountId: 1,
    hashedRt: 'laskdjflkasjdflakdjf',
    exp: new Date().toISOString(),
    iat: new Date().toISOString(),
    aud: 'idp-server',
    ip: '192.168.0.1',
    platform: 'Windows',
    browserBrand: 'Chrome',
    userAgent: 'Chrome 90',
    registerStatus: DEFAULT_REGISTER_STATUS.ACTIVE,
    lastUsedAt: null,
    deletedAt: null,
  });

  const prismaServiceMock = {
    rtToken: {
      create: jest.fn().mockReturnValue(of(mockRtTokenEntity)),
      findUnique: jest.fn().mockReturnValue(of(mockRtTokenEntity)),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RtTokenRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repo = module.get<RtTokenRepository>(RtTokenRepository);
    // * Get a reference to the module's `PrismaService` and save it for usage in our tests.
    database = module.get<PrismaService>(PrismaService);
  });

  // * Reset the mock function calls after each test.
  afterEach(() => {
    jest.clearAllMocks();
  });

  // todo test create and findOne

  it('should be defined', () => {
    expect(repo).toBeDefined();
    expect(database).toBeDefined();
  });

  describe('create function', () => {
    it('should be create a rtToken', (done) => {
      // * Setup
      const rtToken = mockRtTokenEntity;
      // * Action
      repo.create(rtToken).subscribe((result) => {
        // * Assert
        expect(result).toEqual(rtToken);
        done();
      });
    });

    it('should be not create a rtToken', (done) => {
      // * Setup
      prismaServiceMock.rtToken.create.mockReturnValue(of(null));

      const rtToken = mockRtTokenEntity;

      rtToken.ip = '';
      // * Action
      repo.create(rtToken).subscribe((result) => {
        // * Assert
        expect(result).toEqual(null);
        done();
      });
    });

    it('should be return a rtToken', (done) => {
      // * Action
      repo
        .findOne({ accountId: mockRtTokenEntity.accountId })
        .subscribe((result) => {
          // * Assert
          expect(result).toEqual(mockRtTokenEntity);
          done();
        });
    });

    it('should be not return a rtToken', (done) => {
      // * Setup
      prismaServiceMock.rtToken.findUnique.mockReturnValue(of(null));

      repo.findOne({ accountId: null }).subscribe((result) => {
        // * Assert
        expect(result).toEqual(null);
        done();
      });
    });
  });
});
