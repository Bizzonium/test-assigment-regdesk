import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

import { getErrorMessage } from '@azizonkg/common'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()

    const message = getErrorMessage(exception)

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception instanceof Error
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.INTERNAL_SERVER_ERROR

    const responseBody = {
      statusCode: httpStatus,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    this.logger.error(responseBody)

    httpAdapter.reply(ctx.getResponse<Response>(), responseBody, httpStatus)
  }
}
