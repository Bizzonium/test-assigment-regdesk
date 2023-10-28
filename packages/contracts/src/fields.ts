import { initContract } from '@ts-rest/core'
import * as mongoose from 'mongoose'
import { z } from 'zod'

import { DocumentIdSchema } from './documents'
import { UserIdSchema } from './users'

const c = initContract()

export const FieldIdSchema = z.custom<mongoose.Types.ObjectId>((val) => {
  return typeof val === 'string' ? mongoose.Types.ObjectId.isValid(val) : false
})
export type FieldId = z.infer<typeof FieldIdSchema>

export const FieldBaseSchema = z.object({
  id: FieldIdSchema,
  name: z.string(),
  document: DocumentIdSchema,
  parent: FieldIdSchema.optional(),
})

export const FieldTextInputSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
})

export const FieldContainerSchema = z.object({
  type: z.literal('container'),
  permissions: z
    .object({
      user: UserIdSchema,
      permission: z.enum(['none', 'view', 'edit']),
    })
    .array()
    .optional(),
  // TODO: recursive type
  fields: z.any().optional(),
})

export const FieldSchema = z.discriminatedUnion('type', [
  FieldBaseSchema.merge(FieldTextInputSchema),
  FieldBaseSchema.merge(FieldContainerSchema),
])
export type Field = z.infer<typeof FieldSchema>

export const CreateFieldDtoSchema = z.discriminatedUnion('type', [
  FieldBaseSchema.omit({ id: true }).merge(FieldTextInputSchema),
  FieldBaseSchema.omit({ id: true }).merge(
    FieldContainerSchema.omit({ fields: true })
  ),
])
export type CreateFieldDto = z.infer<typeof CreateFieldDtoSchema>

export const UpdateFieldDtoSchema = z.discriminatedUnion('type', [
  FieldBaseSchema.omit({ id: true, parent: true, document: true }).merge(
    FieldTextInputSchema
  ),
  FieldBaseSchema.omit({ id: true, parent: true, document: true }).merge(
    FieldContainerSchema.omit({ fields: true })
  ),
])
export type UpdateFieldDto = z.infer<typeof UpdateFieldDtoSchema>

// TODO: database models should be moved from app to separate package to be used by both app and contracts

export const FieldsContract = c.router({
  getFields: {
    method: 'GET',
    path: '/fields',
    responses: {
      // TODO: figure out types
      // 200: z.array(FieldSchema),
      200: z.any(),
    },
    summary: 'Get the collection of fields',
  },
  getField: {
    method: 'GET',
    path: '/fields/:fieldId',
    responses: {
      // TODO: figure out types
      // 200: FieldSchema,
      200: z.any(),
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
      // TODO: figure out types
      // 200: FieldSchema,
      200: z.any(),
      400: z.object({
        message: z.string(),
      }),
    },
    body: CreateFieldDtoSchema,
    summary: 'Add a new field',
  },
  updateField: {
    method: 'PUT',
    path: '/fields/:fieldId',
    responses: {
      // TODO: figure out types
      // 200: FieldSchema,
      200: z.any(),
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      fieldId: FieldIdSchema,
    }),
    body: UpdateFieldDtoSchema,
    summary: 'Update an existing field',
  },
  removeField: {
    method: 'DELETE',
    path: '/fields/:fieldId',
    responses: {
      204: z.undefined(),
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
