import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import type {
  CreateDocumentDto,
  Document as DocumentDto,
  DocumentId,
  UpdateDocumentDto,
} from '@azizonkg/contracts'

import type { User } from '../auth/entities/user.entity'
import { PermissionLevel } from '../fields/enums/permission-level.enum'
import { Document } from './schemas/document.schema'

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>
  ) {}

  private readonly logger = new Logger(DocumentsService.name)

  async getDocuments(user: User): Promise<DocumentDto[]> {
    const documents = await this.documentModel.find().populate({
      path: 'fields',
      match: {
        $or: [
          {
            permissions: {
              $elemMatch: {
                $or: [
                  {
                    user: user.id,
                    permission: PermissionLevel.EDIT,
                  },
                  {
                    user: user.id,
                    permission: PermissionLevel.VIEW,
                  },
                ],
              },
            },
          },
          { permissions: { $exists: false } },
        ],
      },
    })

    return documents.map((document) => {
      return {
        id: document._id,
        name: document.name,
        fields: document.fields,
      }
    })
  }

  async getDocument(user: User, id: DocumentId): Promise<DocumentDto | null> {
    const document = await this.documentModel.findById(id).populate({
      path: 'fields',
      match: {
        $or: [
          {
            permissions: {
              $elemMatch: {
                $or: [
                  {
                    user: user.id,
                    permission: PermissionLevel.EDIT,
                  },
                  {
                    user: user.id,
                    permission: PermissionLevel.VIEW,
                  },
                ],
              },
            },
          },
          { permissions: { $exists: false } },
        ],
      },
    })

    if (!document) {
      return null
    }

    return {
      id: document._id,
      name: document.name,
      fields: document.fields,
    }
  }

  async addDocument(
    createDocumentDto: CreateDocumentDto
  ): Promise<DocumentDto> {
    const document = new this.documentModel(createDocumentDto)
    await document.save()

    return {
      id: document._id,
      name: document.name,
    }
  }

  async updateDocument(
    id: DocumentId,
    updateDocumentDto: UpdateDocumentDto
  ): Promise<DocumentDto | null> {
    const document = await this.documentModel.findByIdAndUpdate(
      id,
      updateDocumentDto,
      {
        setDefaultsOnInsert: true,
      }
    )

    if (!document) {
      return null
    }

    return {
      id: document._id,
      name: document.name,
      fields: document.fields,
    }
  }

  async removeDocument(id: DocumentId): Promise<DocumentDto | null> {
    const document = await this.documentModel.findByIdAndDelete(id)

    if (!document) {
      return null
    }

    return {
      id: document._id,
      name: document.name,
      fields: document.fields,
    }
  }
}
