import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, of } from 'rxjs';
import { IDefaultError } from 'src/shared/errors';
import { RequestClientInfo } from 'src/shared/types';
import { Either } from 'src/shared/utility-types';
import {
  Public,
  GetCurrentAccount,
  GetCurrentAccountId,
  GetRequestClientInfo,
  Roles,
} from '../../shared/decorators';
import { RtGuard, AtGuard } from '../../shared/guards';
import { SigninDto, SignupDto } from '../dto';
import { AuthService } from '../services';
import { Tokens } from '../types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(
    @Body() signupDto: SignupDto,
    @GetRequestClientInfo() clientInfo: RequestClientInfo,
  ): any {
    return this.authService.signupLocal(signupDto, clientInfo);
  }

  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(
    @Body() signinDto: SigninDto,
  ): Observable<Either<IDefaultError, Tokens>> {
    return this.authService.signinLocal(signinDto);
  }

  // todo
  /* 
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentAccountId() accountId: number): Promise<boolean> {
    return this.authService.logout(accountId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentAccountId() accountId: number,
    @GetCurrentAccount('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(accountId, refreshToken); 
  }
  */
}
