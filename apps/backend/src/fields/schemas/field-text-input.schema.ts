import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

import type { DocumentDocument } from '../../documents/schemas/document.schema'
import type { FieldType } from '../enums/field-type.enum'
import type { FieldDocument } from './field.schema'

@Schema()
export class FieldTextInput {
  name!: string
  type!: FieldType
  document!: DocumentDocument
  parent!: FieldDocument | undefined

  @Prop({ required: true })
  content!: string
}

export type FieldTextInputDocument = HydratedDocument<FieldTextInput>

export const FieldTextInputSchema = SchemaFactory.createForClass(FieldTextInput)
