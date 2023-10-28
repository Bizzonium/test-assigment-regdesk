import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Document, DocumentSchema } from './schemas/document.schema'
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
