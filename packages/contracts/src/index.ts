import { initContract } from '@ts-rest/core'

import { DocumentsContract } from './documents'
import { FieldsContract } from './fields'
import { UsersContract } from './users'

const c = initContract()

export const contracts = c.router(
  {
    users: UsersContract,
    documents: DocumentsContract,
    fields: FieldsContract,
  },
  {
    strictStatusCodes: true,
    validateResponseOnClient: true,
    pathPrefix: '/api',
  }
)

export const { users, documents, fields } = contracts

export * from './users'
export * from './documents'
export * from './fields'
