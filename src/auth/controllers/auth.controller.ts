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
import {
  JwtPayload,
  JwtPayloadWithRt,
  RequestClientInfo,
} from 'src/shared/types';
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
import { Tokens } from 'src/shared/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(
    @Body() signupDto: SignupDto,
    @GetCurrentAccount() account: any,
    @GetRequestClientInfo() clientInfo: RequestClientInfo,
  ): any {
    return this.authService.signupLocal(signupDto, clientInfo);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(
    @Body() signinDto: SigninDto,
    @GetCurrentAccount() account: any,
    @GetRequestClientInfo() clientInfo: RequestClientInfo,
  ): Observable<Either<IDefaultError, Tokens>> {
    return this.authService.signinLocal(signinDto, clientInfo);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @GetCurrentAccount() jwtPayloadWithRt: JwtPayloadWithRt,
  ): Observable<Either<IDefaultError, boolean>> {
    return this.authService.logout(jwtPayloadWithRt);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentAccount() jwtPayloadWithRt: JwtPayloadWithRt,
    @GetRequestClientInfo() clientInfo: RequestClientInfo,
  ): Observable<Either<IDefaultError, Tokens>> {
    return this.authService.refreshTokens(jwtPayloadWithRt, clientInfo);
  }
}
