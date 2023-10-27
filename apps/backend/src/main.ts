import type { LogLevel } from '@nestjs/common'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import { generateOpenApi } from '@ts-rest/open-api'
import helmet from 'helmet'

import { envGeneric as env } from '@azizonkg/env'

import { AppModule } from './app.module'

async function bootstrap() {
  const isDev: boolean = env.NODE_ENV == 'development'

  const logger: LogLevel[] = []
  if (isDev) {
    logger.push('log', 'error', 'warn', 'verbose', 'debug')
  } else {
    logger.push('log', 'error', 'warn')
  }

  const app = await NestFactory.create(AppModule, { logger })

  app.enableShutdownHooks()

  app.use(helmet())
  if (isDev) {
    console.log('Running in dev, enabled CORS')
    app.enableCors()
  }

  app.useGlobalPipes(new ValidationPipe())

  await app.listen(env.BACKEND_BIND_PORT, env.BACKEND_BIND_HOST)
  console.log(`Application is running on: ${await app.getUrl()}`)
}

void bootstrap()
