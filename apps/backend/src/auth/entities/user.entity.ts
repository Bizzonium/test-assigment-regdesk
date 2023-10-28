import type * as mongoose from 'mongoose'

export class User {
  id!: mongoose.Types.ObjectId
  username!: string
}
