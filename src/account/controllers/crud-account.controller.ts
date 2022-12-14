import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { IDefaultError } from 'src/shared/errors';
import { Either } from 'src/shared/utility-types';
import { CreateAccountDto, UpdateAccountDto } from '../dto';
import { AccountEntity, IPublicAccount } from '../entities';
import { CrudAccountService } from '../services';

@Controller('accounts')
export class CrudAccountController {
  constructor(private readonly crudAccountService: CrudAccountService) {}

  @Post('create')
  create(
    @Body() createAccountDto: CreateAccountDto,
  ): Observable<Either<IDefaultError, IPublicAccount>> {
    return this.crudAccountService.create(createAccountDto);
  }

  @Get('get/:id')
  getById(
    @Param('id') id: number,
  ): Observable<Either<IDefaultError, IPublicAccount>> {
    return this.crudAccountService.getById(Number(id));
  }

  @Post('get-one')
  getOne(
    @Body() query: Partial<AccountEntity>,
  ): Observable<Either<IDefaultError, IPublicAccount>> {
    return this.crudAccountService.findOne(query);
  }

  @Post('get-all')
  getAll(
    @Body() query: Partial<AccountEntity>,
  ): Observable<Either<IDefaultError, IPublicAccount[]>> {
    return this.crudAccountService.getMany(query);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Observable<Either<IDefaultError, IPublicAccount>> {
    return this.crudAccountService.update(Number(id), updateAccountDto);
  }

  @Patch('remove/:id')
  softDelete(
    @Param('id') id: number,
  ): Observable<Either<IDefaultError, IPublicAccount>> {
    return this.crudAccountService.softDelete(Number(id));
  }

  @Patch('restore/:id')
  restore(
    @Param('id') id: number,
  ): Observable<Either<IDefaultError, IPublicAccount>> {
    return this.crudAccountService.restore(Number(id));
  }

  @Delete('hard-delete/:id')
  hardDelete(
    @Param('id') id: number,
  ): Observable<Either<IDefaultError, IPublicAccount>> {
    return this.crudAccountService.hardDelete(Number(id));
  }

  @Patch('send-recovery-keys')
  sendRecoveryKeys(
    @Body('ids') ids: number[],
  ): Observable<Either<IDefaultError, IPublicAccount>> {
    return this.crudAccountService.sendRecoveryKeyToAccounts(ids);
  }
}
