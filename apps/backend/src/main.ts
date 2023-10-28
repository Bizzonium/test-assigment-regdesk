import type { LogLevel } from '@nestjs/common'
import { ValidationPipe } from '@nestjs/common'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import { generateOpenApi } from '@ts-rest/open-api'
import helmet from 'helmet'

import { contracts } from '@azizonkg/contracts'
import { envGeneric as env } from '@azizonkg/env'

import { AppModule } from './app.module'
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter'

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

  const document = generateOpenApi(
    contracts,
    {
      info: {
        title: 'Backend API',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${env.BACKEND_BIND_HOST}:${env.BACKEND_BIND_PORT}`,
          description: 'Development server',
        },
      ],
      externalDocs: {
        description: 'Swagger JSON Schema',
        url: '/api-json',
      },
    },
    {
      setOperationId: true,
    }
  )

  SwaggerModule.setup('api', app, document)

  app.use(helmet())
  if (isDev) {
    console.log('Running in dev, enabled CORS')
    app.enableCors()
  }

  app.useGlobalPipes(new ValidationPipe())

  const httpAdapterHost = app.get(HttpAdapterHost)
  app.useGlobalFilters(new MongoExceptionFilter(httpAdapterHost))

  await app.listen(env.BACKEND_BIND_PORT, env.BACKEND_BIND_HOST)
  console.log(`Application is running on: ${await app.getUrl()}`)
}

void bootstrap()
