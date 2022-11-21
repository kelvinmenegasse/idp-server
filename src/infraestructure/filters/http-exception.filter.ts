import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { IDefaultError } from 'src/shared/errors';
import { Either } from 'src/shared/utility-types';
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    const exceptionJson =
      exception instanceof HttpException ? exception.getResponse() : exception;

    console.log(exceptionJson);

    const responseError: Either<IDefaultError, any> = {
      left: {
        statusCode: status,
        name: exception.name,
        message: exceptionJson.message,
      } as IDefaultError,
    };

    response.status(status).json(responseError);
  }
}
