import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { from, Observable } from 'rxjs';
import { AccountEntity } from '../entities';

@Injectable()
export class AccountMailService {
  constructor(
    private mailerService: MailerService,
    private config: ConfigService,
  ) {}

  sendRecoveryKey(params: {
    account: AccountEntity;
    recoveryKey: string;
  }): Observable<any> {
    const mail = {
      transporterName: 'secondary',
      from: this.config.get<string>('mailSecondary')['alias'],
      to: <string>params.account.email,
      subject: 'Recuperação de Senha | Prefeitura de Franco da Rocha',
      template: './password-recovery',
      context: {
        // ? current time in america/sao_paulo time zone
        currentTime: new Date().toLocaleString(
          <string>this.config.get('LOCALE'),
          {
            timeZone: <string>this.config.get('app.TZ'),
          },
        ),
        recoveryKey: params.recoveryKey,
        fullname: params.account.name,
        recoveryLink: `${this.config.get<string>(
          'APP_DOMAIN_FRONTEND',
        )}/auth/recovery?username=${params.account.username}&recoveryKey=${
          params.recoveryKey
        }`,
        emailToContact: 'sistemas@francodarocha.sp.gov.br',
      },
    };
    return from(this.mailerService.sendMail(mail));
  }
}
