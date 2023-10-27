// import { User } from '@/src/users/schemas/user.schema'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

import type { Document } from '../../documents/schemas/document.schema'
import type { Field } from './field.schema'

@Schema()
export class FieldTextInput {
  name!: string
  type!: string
  document!: Document
  parent!: Field

  @Prop({ default: null })
  content!: string
}

export type FieldTextInputDocument = HydratedDocument<FieldTextInput>

export const FieldTextInputSchema = SchemaFactory.createForClass(FieldTextInput)
