import type { FieldDocument } from '@/src/fields/schemas/field.schema'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import * as mongoose from 'mongoose'

/**
 * A document is a set of different fields
 */
@Schema()
export class Document {
  @Prop({ required: true })
  name!: string

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Field' }],
    index: true,
  })
  fields!: mongoose.Types.DocumentArray<FieldDocument>
  // fields!: FieldDocument[] | mongoose.Types.ObjectId[]
}

export type DocumentDocument = HydratedDocument<Document>

export const DocumentSchema = SchemaFactory.createForClass(Document)
