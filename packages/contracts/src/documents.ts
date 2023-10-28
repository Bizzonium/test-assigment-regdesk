import { initContract } from '@ts-rest/core'
import * as mongoose from 'mongoose'
import { z } from 'zod'

const c = initContract()

export const DocumentIdSchema = z.custom<mongoose.Types.ObjectId>((val) => {
  return typeof val === 'string' ? mongoose.Types.ObjectId.isValid(val) : false
})
export type DocumentId = z.infer<typeof DocumentIdSchema>

export const DocumentSchema = z.object({
  id: DocumentIdSchema,
  name: z.string(),
  // TODO: figure out types
  // fields: z.array(FieldSchema).optional(),
  fields: z.any(),
})
export type Document = z.infer<typeof DocumentSchema>

export const CreateDocumentDtoSchema = DocumentSchema.omit({
  id: true,
  fields: true,
})
export type CreateDocumentDto = z.infer<typeof CreateDocumentDtoSchema>

export const UpdateDocumentDtoSchema = DocumentSchema.omit({
  id: true,
  fields: true,
})
export type UpdateDocumentDto = z.infer<typeof UpdateDocumentDtoSchema>

export const DocumentsContract = c.router({
  getDocuments: {
    method: 'GET',
    path: '/documents',
    responses: {
      200: z.array(DocumentSchema),
    },
    summary: 'Get the collection of documents',
  },
  getDocument: {
    method: 'GET',
    path: '/documents/:documentId',
    responses: {
      200: DocumentSchema,
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      documentId: DocumentIdSchema,
    }),
    summary: 'Get a single document',
  },
  addDocument: {
    method: 'POST',
    path: '/documents',
    responses: {
      200: DocumentSchema,
      400: z.object({
        message: z.string(),
      }),
    },
    body: CreateDocumentDtoSchema,
    summary: 'Add a new document',
  },
  updateDocument: {
    method: 'PUT',
    path: '/documents/:documentId',
    responses: {
      200: DocumentSchema,
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      documentId: DocumentIdSchema,
    }),
    body: UpdateDocumentDtoSchema,
    summary: 'Update an existing document',
  },
  removeDocument: {
    method: 'DELETE',
    path: '/documents/:documentId',
    responses: {
      204: z.undefined(),
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      documentId: DocumentIdSchema,
    }),
    body: null,
    summary: 'Remove an existing document',
  },
})
