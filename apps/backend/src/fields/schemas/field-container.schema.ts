import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import * as mongoose from 'mongoose'

import type { DocumentDocument } from '../../documents/schemas/document.schema'
import type { FieldType } from '../enums/field-type.enum'
import type { FieldDocument } from './field.schema'
import type { PermissionDocument } from './permission.schema'
import { PermissionSchema } from './permission.schema'

@Schema()
export class FieldContainer {
  name!: string
  type!: FieldType
  document!: DocumentDocument
  parent?: FieldDocument

  @Prop({
    type: [PermissionSchema],
    required: true,
    default: [],
    index: true,
    sparse: true,
  })
  permissions!: mongoose.Types.DocumentArray<PermissionDocument>
  // permissions!: PermissionDocument[]

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
      },
    ],
    required: true,
    default: [],
    index: true,
    sparse: true,
  })
  fields!: mongoose.Types.DocumentArray<FieldDocument>
  // fields!: FieldDocument[]
}

export type FieldContainerDocument = HydratedDocument<FieldContainer>

export const FieldContainerSchema = SchemaFactory.createForClass(FieldContainer)
