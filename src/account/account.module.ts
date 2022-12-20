import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../infraestructure/database/database.module';
import { CrudAccountController } from './controllers/';
import { AccountRepository } from './repositories';
import { AccountMailService, CrudAccountService } from './services/';

@Module({
  imports: [forwardRef(() => DatabaseModule)],
  controllers: [CrudAccountController],
  exports: [CrudAccountService, AccountMailService],
  providers: [AccountRepository, CrudAccountService, AccountMailService],
})
export class AccountModule {}
