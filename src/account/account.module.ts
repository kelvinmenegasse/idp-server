import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../infraestructure/database/database.module';
import { CrudAccountController } from './controllers/';
import { AccountRepository } from './repositories';
import { CrudAccountService } from './services/';

@Module({
  imports: [forwardRef(() => DatabaseModule)],
  controllers: [CrudAccountController],
  exports: [CrudAccountService],
  providers: [AccountRepository, CrudAccountService],
})
export class AccountModule {}
