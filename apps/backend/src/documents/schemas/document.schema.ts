import type { Field } from '@/src/fields/schemas/field.schema'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import * as mongoose from 'mongoose'

export type DocumentDocument = HydratedDocument<Document>

/**
 * A document is a set of different fields
 */
@Schema()
export class Document {
  @Prop({ required: true })
  name!: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Field', index: true })
  fields!: Field[]
}

export const DocumentSchema = SchemaFactory.createForClass(Document)
