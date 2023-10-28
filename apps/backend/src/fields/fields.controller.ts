import { Controller, HttpStatus } from '@nestjs/common'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'

import { fields } from '@azizonkg/contracts'

import { User } from '../auth/decorators/user.decorator'
import { User as UserEntity } from '../auth/entities/user.entity'
import { FieldsService } from './fields.service'

@Controller()
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @TsRestHandler(fields.getFields)
  getFields(@User() user: UserEntity) {
    return tsRestHandler(fields.getFields, async () => {
      const fields = await this.fieldsService.getFields(user)
      return { status: HttpStatus.OK, body: fields }
    })
  }

  @TsRestHandler(fields.getField)
  getField(
    @User() user: UserEntity
  ): ReturnType<typeof tsRestHandler<typeof fields.getField>> {
    return tsRestHandler(fields.getField, async ({ params }) => {
      const field = await this.fieldsService.getField(user, params.fieldId)
      if (!field) {
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            message: `Field with id "${params.fieldId.toString()}" not found`,
          },
        }
      }
      return { status: HttpStatus.OK, body: field }
    })
  }

  @TsRestHandler(fields.addField)
  addField(
    @User() user: UserEntity
  ): ReturnType<typeof tsRestHandler<typeof fields.addField>> {
    return tsRestHandler(fields.addField, async ({ body }) => {
      const field = await this.fieldsService.addField(user, body)
      return { status: HttpStatus.OK, body: field }
    })
  }

  @TsRestHandler(fields.updateField)
  updateField(
    @User() user: UserEntity
  ): ReturnType<typeof tsRestHandler<typeof fields.updateField>> {
    return tsRestHandler(fields.updateField, async ({ params, body }) => {
      const field = await this.fieldsService.updateField(
        user,
        params.fieldId,
        body
      )
      if (!field) {
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            message: `Field with id "${params.fieldId.toString()}" not found or you don't have permission to edit it`,
          },
        }
      }
      return { status: HttpStatus.OK, body: field }
    })
  }

  @TsRestHandler(fields.removeField)
  removeField(
    @User() user: UserEntity
  ): ReturnType<typeof tsRestHandler<typeof fields.removeField>> {
    return tsRestHandler(fields.removeField, async ({ params }) => {
      const field = await this.fieldsService.removeField(user, params.fieldId)
      if (!field) {
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            message: `Field with id "${params.fieldId.toString()}" not found or you don't have permission to edit it`,
          },
        }
      }
      return { status: HttpStatus.NO_CONTENT }
    })
  }
}
