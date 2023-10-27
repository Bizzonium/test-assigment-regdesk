import type { MiddlewareConsumer, NestModule } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import { envGeneric as env } from '@azizonkg/env'

import { RequestLoggingMiddleware } from './middlewares/request-logging.middleware'

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(env.MONGODB_URI),
  ],
  providers: [],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*')
  }
}
