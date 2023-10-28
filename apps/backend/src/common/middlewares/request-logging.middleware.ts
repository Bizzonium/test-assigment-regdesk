import type { NestMiddleware } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP')

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, body } = request as unknown as {
      ip: string
      method: string
      originalUrl: string
      body: never
    }
    const userAgent = request.get('user-agent') ?? ''

    response.on('finish', () => {
      const { statusCode } = response
      const contentLength = response.get('content-length')

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
        body
      )
    })

    next()
  }
}
