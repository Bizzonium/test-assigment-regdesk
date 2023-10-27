import type { User as UserEntity } from '@/src/auth/entities/user.entity'
import type { ExecutionContext } from '@nestjs/common'
import { createParamDecorator } from '@nestjs/common'

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request & { user: UserEntity | undefined } = ctx
      .switchToHttp()
      .getRequest()
    return request?.user
  }
)
