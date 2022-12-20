import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AccountMailService } from './account-mail.service';
import { AccountEntity } from '../entities';

describe('AccountMailService', () => {
  // * MOCKS
  let service: AccountMailService;
  let mailerService: MailerService;
  let config: ConfigService;

  const mockMailerService = {
    sendMail: jest.fn().mockReturnValue(of(true)),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        mailPrimary: {
          alias: 'alias-test',
          host: 'host-test',
          port: '3000',
          user: 'user-test',
          pass: 'pass-test',
        },
        mailSecondary: {
          alias: 'alias-test',
          host: 'host-test',
          port: '3000',
          user: 'user-test',
          pass: 'pass-test',
        },
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountMailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AccountMailService>(AccountMailService);
    mailerService = module.get<MailerService>(MailerService);
    config = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mailerService).toBeDefined();
    expect(config).toBeDefined();
  });

  describe('sendRecoveryKey', () => {
    it('should send an email', (done) => {
      // * Arrange
      const params: {
        account: AccountEntity;
        recoveryKey: string;
      } = {
        account: new AccountEntity({
          id: 1,
          name: 'Kelvin Menegasse',
          email: 'kelvin@menegasse.com',
        }),
        recoveryKey: '123456',
      };

      // * Act
      service.sendRecoveryKey(params).subscribe({
        next: (result) => {
          // * Assert
          expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
          expect(result).toBeDefined();
        },
        complete: () => done(),
      });
    });
  });
});
