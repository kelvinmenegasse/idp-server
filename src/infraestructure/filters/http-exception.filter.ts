import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { DefaultException } from '../errors';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // const request = ctx.getRequest();

    const error = new DefaultException(
      {
        name:
          exception instanceof DefaultException
            ? exception.name
            : 'SERVER_ERROR',
        message:
          exception instanceof DefaultException
            ? exception.getResponse()
            : exception,
      },
      exception instanceof DefaultException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR,
    );

    console.error(exception);

    response.status(error.getStatus()).json(error.getJson());
  }
}
