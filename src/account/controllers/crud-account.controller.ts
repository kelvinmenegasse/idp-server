import { Body, Controller, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IDefaultError } from 'src/shared/errors';
import { Either } from 'src/shared/utility-types';
import { CreateAccountDto } from '../dto';
import { AccountEntity } from '../entities';
import { CrudAccountService } from '../services';

@Controller('account')
export class CrudAccountController {
  constructor(private readonly crudAccountService: CrudAccountService) {}

  @Post()
  create(
    @Body() createAccountDto: CreateAccountDto,
  ): Observable<Either<IDefaultError, AccountEntity>> {
    return this.crudAccountService.create(createAccountDto);
  }
}
