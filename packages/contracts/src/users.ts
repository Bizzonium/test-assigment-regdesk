import { initContract } from '@ts-rest/core'
import * as mongoose from 'mongoose'
import { z } from 'zod'

const c = initContract()

export const UserIdSchema = z.custom<mongoose.Types.ObjectId>((val) => {
  return typeof val === 'string' ? mongoose.Types.ObjectId.isValid(val) : false
})
export type UserId = z.infer<typeof UserIdSchema>

export const UsernameSchema = z.string()
export type Username = z.infer<typeof UsernameSchema>

export const UserSchema = z.object({
  id: UserIdSchema,
  username: UsernameSchema,
})
export type User = z.infer<typeof UserSchema>

export const CreateUserDtoSchema = UserSchema.omit({ id: true })
export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>

export const UpdateUserDtoSchema = UserSchema.omit({ id: true })
export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>

export const UsersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/users',
    responses: {
      200: z.array(UserSchema),
    },
    summary: 'Get the collection of users',
  },
  getUser: {
    method: 'GET',
    path: '/users/:username',
    responses: {
      200: UserSchema,
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      username: UsernameSchema,
    }),
    summary: 'Get a single user',
  },
  addUser: {
    method: 'POST',
    path: '/users',
    responses: {
      200: UserSchema,
      400: z.object({
        message: z.string(),
      }),
    },
    body: CreateUserDtoSchema,
    summary: 'Add a new user',
  },
  updateUser: {
    method: 'PUT',
    path: '/users/:username',
    responses: {
      200: UserSchema,
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      username: UsernameSchema,
    }),
    body: UpdateUserDtoSchema,
    summary: 'Update an existing user',
  },
  removeUser: {
    method: 'DELETE',
    path: '/users/:username',
    responses: {
      204: z.undefined(),
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      username: UsernameSchema,
    }),
    body: null,
    summary: 'Remove an existing user',
  },
})
