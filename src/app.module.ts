import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { DatabaseModule } from './infraestructure/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './infraestructure/mail/mail.module';
// import databaseConfig from './infraestructure/config/database.config';
import appConfig from './infraestructure/config/app.config';
import authConfig from './infraestructure/config/auth.config';
import mailPrimaryConfig from './infraestructure/config/mail-primary.config';
import mailSecondaryConfig from './infraestructure/config/mail-secondary.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        // databaseConfig, // ? This is not needed because we are using the DatabaseModule and Prisma
        authConfig,
        mailPrimaryConfig,
        mailSecondaryConfig,
      ],
    }),
    DatabaseModule,
    MailModule,
    AccountModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
