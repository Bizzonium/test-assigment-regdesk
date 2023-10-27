import { initContract } from '@ts-rest/core'
import type * as mongoose from 'mongoose'
import { z } from 'zod'

const c = initContract()

export const UserIdSchema = z.custom<mongoose.Types.ObjectId>()
export type UserId = z.infer<typeof UserIdSchema>

export const UserSchema = z.object({
  _id: UserIdSchema,
  username: z.string(),
})

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
    path: '/users/:userId',
    responses: {
      200: UserSchema,
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      userId: UserIdSchema,
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
    body: null,
    summary: 'Add a new user',
  },
  updateUser: {
    method: 'PUT',
    path: '/users/:userId',
    responses: {
      200: UserSchema,
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      userId: UserIdSchema,
    }),
    body: null,
    summary: 'Update an existing user',
  },
  removeUser: {
    method: 'DELETE',
    path: '/users/:userId',
    responses: {
      204: z.object({
        message: z.string(),
      }),
      404: z.object({
        message: z.string(),
      }),
    },
    pathParams: z.object({
      userId: UserIdSchema,
    }),
    body: null,
    summary: 'Remove an existing user',
  },
})
