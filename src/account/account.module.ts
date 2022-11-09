import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../infraestructure/database/database.module';
import { AccountController } from './controllers/';
import { AccountRepository } from './repositories';
import { AccountService } from './services/';

@Module({
  imports: [forwardRef(() => DatabaseModule)],
  controllers: [AccountController],
  providers: [AccountRepository, AccountService],
})
export class AccountModule {}
