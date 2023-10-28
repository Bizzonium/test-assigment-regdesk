import type { MiddlewareConsumer, NestModule } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import { envGeneric as env } from '@azizonkg/env'

import { AuthModule } from './auth/auth.module'
import { RequestLoggingMiddleware } from './common/middlewares/request-logging.middleware'
import { DocumentsModule } from './documents/documents.module'
import { FieldsModule } from './fields/fields.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(env.MONGODB_URI, {
      // Should be disabled on production for performance reasons
      // see https://mongoosejs.com/docs/guide.html#indexes
      autoIndex: env.NODE_ENV !== 'production',
      autoCreate: true,
    }),
    AuthModule,
    UsersModule,
    FieldsModule,
    DocumentsModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*')
  }
}
