import { Controller, HttpStatus } from '@nestjs/common'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'

import { documents } from '@azizonkg/contracts'

import { User } from '../auth/decorators/user.decorator'
import { User as UserEntity } from '../auth/entities/user.entity'
import { DocumentsService } from './documents.service'

@Controller()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @TsRestHandler(documents.getDocuments)
  getDocuments(@User() user: UserEntity) {
    return tsRestHandler(documents.getDocuments, async () => {
      const documents = await this.documentsService.getDocuments(user)
      return { status: HttpStatus.OK, body: documents }
    })
  }

  @TsRestHandler(documents.getDocument)
  getDocument(
    @User() user: UserEntity
  ): ReturnType<typeof tsRestHandler<typeof documents.getDocument>> {
    return tsRestHandler(documents.getDocument, async ({ params }) => {
      const document = await this.documentsService.getDocument(
        user,
        params.documentId
      )
      if (!document) {
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            message: `Document with id "${params.documentId.toString()}" not found`,
          },
        }
      }
      return { status: HttpStatus.OK, body: document }
    })
  }

  @TsRestHandler(documents.addDocument)
  addDocument(): ReturnType<
    typeof tsRestHandler<typeof documents.addDocument>
  > {
    return tsRestHandler(documents.addDocument, async ({ body }) => {
      const document = await this.documentsService.addDocument(body)
      return { status: HttpStatus.OK, body: document }
    })
  }

  @TsRestHandler(documents.updateDocument)
  updateDocument(): ReturnType<
    typeof tsRestHandler<typeof documents.updateDocument>
  > {
    return tsRestHandler(documents.updateDocument, async ({ params, body }) => {
      const document = await this.documentsService.updateDocument(
        params.documentId,
        body
      )
      if (!document) {
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            message: `Document with id "${params.documentId.toString()}" not found`,
          },
        }
      }
      return { status: HttpStatus.OK, body: document }
    })
  }

  @TsRestHandler(documents.removeDocument)
  removeDocument(): ReturnType<
    typeof tsRestHandler<typeof documents.removeDocument>
  > {
    return tsRestHandler(documents.removeDocument, async ({ params }) => {
      const document = await this.documentsService.removeDocument(
        params.documentId
      )
      if (!document) {
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            message: `Document with id "${params.documentId.toString()}" not found`,
          },
        }
      }
      return { status: HttpStatus.NO_CONTENT }
    })
  }
}
