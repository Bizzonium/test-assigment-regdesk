import { IS_PUBLIC_KEY } from '@/src/auth/decorators/public.decorator'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Observable } from 'rxjs'

import type { User as UserEntity } from './entities/user.entity'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  private readonly logger = new Logger(AuthGuard.name)

  canActivate(
    context: ExecutionContext
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

    // Mock user
    const user: UserEntity = {
      id: '',
      username: '',
    }

    request.user = user

    return true
  }
}
