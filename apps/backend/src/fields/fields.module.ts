import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { FieldType } from './enums/field-type.enum'
import { FieldsController } from './fields.controller'
import { FieldsService } from './fields.service'
import { FieldContainerSchema } from './schemas/field-container.schema'
import { FieldTextInputSchema } from './schemas/field-text-input.schema'
import { Field, FieldSchema } from './schemas/field.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Field.name,
        schema: FieldSchema,
        discriminators: [
          { name: FieldType.TEXT, schema: FieldTextInputSchema },
          { name: FieldType.CONTAINER, schema: FieldContainerSchema },
        ],
      },
    ]),
  ],
  controllers: [FieldsController],
  providers: [FieldsService],
})
export class FieldsModule {}
