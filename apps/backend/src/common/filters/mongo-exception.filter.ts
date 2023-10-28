import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, HttpStatus, Logger } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { mongo } from 'mongoose'

@Catch(mongo.MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private readonly logger = new Logger(MongoExceptionFilter.name)

  catch(exception: mongo.MongoError, host: ArgumentsHost) {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()

    const status = exception.code

    const responseBody = {
      statusCode: status,
      message: exception.message,
      path: request.url,
    }

    this.logger.error(responseBody)

    httpAdapter.reply(
      ctx.getResponse<Response>(),
      responseBody,
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}
