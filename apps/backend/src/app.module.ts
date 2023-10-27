import type { MiddlewareConsumer, NestModule } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { RequestLoggingMiddleware } from './middlewares/request-logging.middleware'

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*')
  }
}
