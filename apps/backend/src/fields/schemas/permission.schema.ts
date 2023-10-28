import type { UserDocument } from '@/src/users/schemas/user.schema'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import * as mongoose from 'mongoose'

import { PermissionLevel } from '../enums/permission-level.enum'

@Schema()
export class Permission {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user!: UserDocument | mongoose.Types.ObjectId

  @Prop({
    type: String,
    enum: Object.values(PermissionLevel),
    required: true,
  })
  permission!: PermissionLevel
}

export type PermissionDocument = HydratedDocument<Permission>

export const PermissionSchema = SchemaFactory.createForClass(Permission)

PermissionSchema.index({ user: 1, permission: 1 })
