import { Controller, HttpStatus } from '@nestjs/common'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'

import { users } from '@azizonkg/contracts'

import { UsersService } from './users.service'

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @TsRestHandler(users.getUsers)
  getUsers() {
    return tsRestHandler(users.getUsers, async () => {
      const users = await this.usersService.getUsers()
      return { status: HttpStatus.OK, body: users }
    })
  }

  @TsRestHandler(users.getUser)
  getUser(): ReturnType<typeof tsRestHandler<typeof users.getUser>> {
    return tsRestHandler(users.getUser, async ({ params }) => {
      const user = await this.usersService.getUser(params.username)
      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            message: `User with id "${params.username}" not found`,
          },
        }
      }
      return { status: HttpStatus.OK, body: user }
    })
  }

  @TsRestHandler(users.addUser)
  addUser(): ReturnType<typeof tsRestHandler<typeof users.addUser>> {
    return tsRestHandler(users.addUser, async ({ body }) => {
      const user = await this.usersService.addUser(body)
      return { status: HttpStatus.OK, body: user }
    })
  }

  @TsRestHandler(users.updateUser)
  updateUser(): ReturnType<typeof tsRestHandler<typeof users.updateUser>> {
    return tsRestHandler(users.updateUser, async ({ params, body }) => {
      const user = await this.usersService.updateUser(params.username, body)
      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            message: `User with id "${params.username}" not found`,
          },
        }
      }
      return { status: HttpStatus.OK, body: user }
    })
  }

  @TsRestHandler(users.removeUser)
  removeUser(): ReturnType<typeof tsRestHandler<typeof users.removeUser>> {
    return tsRestHandler(users.removeUser, async ({ params }) => {
      const user = await this.usersService.removeUser(params.username)
      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            message: `User with id "${params.username}" not found`,
          },
        }
      }
      return { status: HttpStatus.NO_CONTENT }
    })
  }
}
