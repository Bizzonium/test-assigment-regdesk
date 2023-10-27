import { initContract } from '@ts-rest/core'
import type * as mongoose from 'mongoose'
import { z } from 'zod'

import { DocumentIdSchema } from './documents'

const c = initContract()

export const FieldIdSchema = z.custom<mongoose.Types.ObjectId>()
export type FieldId = z.infer<typeof FieldIdSchema>

export const FieldBaseSchema = z.object({
  name: z.string(),
  type: z.enum(['text', 'container']),
  document: DocumentIdSchema,
  parent: FieldIdSchema.optional(),
})

export const FieldTextInputSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
})

export const FieldContainerSchema = z.object({
  type: z.literal('container'),
})

// export const FieldSchema = z.union([
//   FieldBaseSchema,
//   z.discriminatedUnion('type', [FieldTextInputSchema, FieldContainerSchema]),
// ])
export const FieldSchema = z.union([
  FieldBaseSchema,
  z.discriminatedUnion('type', [FieldTextInputSchema, FieldContainerSchema]),
])
export type Field = z.infer<typeof FieldSchema>

// TODO: database models should be moved from app to separate package to be used by both app and contracts

export const FieldsContract = c.router({
  getFields: {
    method: 'GET',
    path: '/fields',
    responses: {
      200: z.array(FieldSchema),
    },
    summary: 'Get the collection of fields',
  },
  getField: {
    method: 'GET',
    path: '/fields/:fieldId',
    responses: {
      200: FieldSchema,
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      fieldId: FieldIdSchema,
    }),
    summary: 'Get a single field',
  },
  addField: {
    method: 'POST',
    path: '/fields',
    responses: {
      200: FieldSchema,
      400: z.object({
        message: z.string(),
      }),
    },
    body: null,
    summary: 'Add a new field',
  },
  updateField: {
    method: 'PUT',
    path: '/fields/:fieldId',
    responses: {
      200: FieldSchema,
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      fieldId: FieldIdSchema,
    }),
    body: null,
    summary: 'Update an existing field',
  },
  removeField: {
    method: 'DELETE',
    path: '/fields/:fieldId',
    responses: {
      204: z.object({
        message: z.string(),
      }),
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      fieldId: FieldIdSchema,
    }),
    body: null,
    summary: 'Remove an existing field',
  },
})
