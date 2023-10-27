// import { User } from '@/src/users/schemas/user.schema'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import * as mongoose from 'mongoose'

import type { Document } from '../../documents/schemas/document.schema'
import type { Field } from './field.schema'
// import { PermissionLevel } from '../enums/permission-level.enum'
import type { Permission } from './permission.schema'
import { PermissionSchema } from './permission.schema'

@Schema()
export class FieldContainer {
  name!: string
  type!: string
  document!: Document
  parent!: Field

  // Note: we won't be able to create an effective index if we have dynamic key names :((
  // @Prop({
  //   type: Map,
  //   of: { type: String, enum: Object.values(PermissionLevel) },
  //   required: true,
  // })
  // permissions!: Map<mongoose.Schema.Types.ObjectId, PermissionLevel>

  @Prop({ type: [PermissionSchema], required: true, index: true, sparse: true })
  permissions!: Permission[]

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    index: true,
    sparse: true,
  })
  fields!: Field[]
}

export type FieldContainerDocument = HydratedDocument<FieldContainer>

export const FieldContainerSchema = SchemaFactory.createForClass(FieldContainer)
