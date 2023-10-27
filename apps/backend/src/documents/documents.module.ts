import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Document, DocumentSchema } from './schemas/document.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
    ]),
  ],
})
export class DocumentsModule {}
