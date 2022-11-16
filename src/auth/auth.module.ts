import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from 'src/account/account.module';
import { DatabaseModule } from 'src/infraestructure/database/database.module';

import { AuthController } from './controllers';
import { RtTokenRepository } from './repositories';
import { AuthService, RtTokenService } from './services';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  imports: [
    JwtModule.register({}),
    forwardRef(() => DatabaseModule),
    AccountModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RtTokenService,
    RtTokenRepository,
    AtStrategy,
    RtStrategy,
  ],
})
export class AuthModule {}
