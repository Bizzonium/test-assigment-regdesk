import { initContract } from '@ts-rest/core'
import type * as mongoose from 'mongoose'
import { z } from 'zod'

const c = initContract()

export const DocumentIdSchema = z.custom<mongoose.Types.ObjectId>()
export type DocumentId = z.infer<typeof DocumentIdSchema>

export const DocumentSchema = z.object({
  name: z.string(),
})

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
    body: null,
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
    body: null,
    summary: 'Update an existing document',
  },
  removeDocument: {
    method: 'DELETE',
    path: '/documents/:documentId',
    responses: {
      204: z.object({
        message: z.string(),
      }),
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
