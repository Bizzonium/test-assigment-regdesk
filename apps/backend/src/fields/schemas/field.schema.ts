import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import * as mongoose from 'mongoose'

import { Document } from '../../documents/schemas/document.schema'
import { FieldType } from '../enums/field-type.enum'

/**
 * Each field can be a text input or a container for even more fields.
 * - It has to be associated with a document;
 * - It has to have permissions;
 * - If it is a text input, it can have a content;
 * - If it is a container, it can have multiple fields;
 * - If it is in a container, it has to have a parent;
 * - Users are free to add, name, edit and remove fields as they see fit,
 *   but only inside the fields they have edit access for;
 *
 */
@Schema({ discriminatorKey: 'type' })
export class Field {
  @Prop({ required: true })
  name!: string

  @Prop({
    type: String,
    enum: [FieldType.CONTAINER, FieldType.TEXT],
    required: true,
  })
  type!: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    index: true,
  })
  document!: Document

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Field', index: true })
  parent!: Field
}

export type FieldDocument = HydratedDocument<Field>

export const FieldSchema = SchemaFactory.createForClass(Field)
