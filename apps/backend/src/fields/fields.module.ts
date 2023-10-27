import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  FieldContainer,
  FieldContainerSchema,
} from './schemas/field-container.schema'
import {
  FieldTextInput,
  FieldTextInputSchema,
} from './schemas/field-text-input.schema'
import { Field, FieldSchema } from './schemas/field.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Field.name,
        schema: FieldSchema,
        discriminators: [
          { name: FieldTextInput.name, schema: FieldTextInputSchema },
          { name: FieldContainer.name, schema: FieldContainerSchema },
        ],
      },
    ]),
  ],
})
export class FieldsModule {}
