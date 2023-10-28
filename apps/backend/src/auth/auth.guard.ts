import { IS_PUBLIC_KEY } from '@/src/auth/decorators/public.decorator'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Observable } from 'rxjs'

import { UsersService } from '../users/users.service'
import type { User as UserEntity } from './entities/user.entity'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService
  ) {}
  private readonly logger = new Logger(AuthGuard.name)

  async canActivate(
    context: ExecutionContext
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: canActivate expected to return this types
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request: Request & {
      user: UserEntity | undefined
    } = context.switchToHttp().getRequest()

    // Mock user authentication
    const username = 'dummyuser'
    let userDoc = await this.usersService.getUser(username)
    if (!userDoc) {
      userDoc = await this.usersService.addUser({
        username: username,
      })
    }

    const user: UserEntity = {
      id: userDoc.id,
      username: userDoc.username,
    }

    request.user = user

    return true
  }
}
