import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import type {
  CreateFieldDto,
  FieldId,
  UpdateFieldDto,
} from '@azizonkg/contracts'

import type { User } from '../auth/entities/user.entity'
import { PermissionLevel } from '../fields/enums/permission-level.enum'
import { FieldType } from './enums/field-type.enum'
import type {
  FieldContainer,
  FieldContainerDocument,
} from './schemas/field-container.schema'
import type {
  FieldTextInput,
  FieldTextInputDocument,
} from './schemas/field-text-input.schema'
import type { FieldDocument } from './schemas/field.schema'
import { Field } from './schemas/field.schema'

@Injectable()
export class FieldsService {
  constructor(
    @InjectModel(Field.name)
    private readonly fieldModel: Model<FieldTextInput | FieldContainer>
  ) {}

  private readonly logger = new Logger(FieldsService.name)

  async getFields(user: User): Promise<FieldDocument[]> {
    // Find fields that user has edit or view permission in container and field itself
    // or fields that don't have permissions (i.e. just text input)
    const fields = await this.fieldModel
      .aggregate<FieldContainerDocument | FieldTextInputDocument>()
      .match({
        $or: [
          { permissions: { $exists: false } },
          {
            permissions: {
              $elemMatch: {
                $or: [
                  {
                    user: user.id,
                    permission: PermissionLevel.EDIT,
                  },
                  {
                    user: user.id,
                    permission: PermissionLevel.VIEW,
                  },
                ],
              },
            },
          },
        ],
      })
      .lookup({
        from: 'fields',
        localField: 'parent',
        foreignField: '_id',
        as: 'parent_doc',
      })
      .unwind({ path: '$parent_doc', preserveNullAndEmptyArrays: true })
      .match({
        $or: [
          { parent_doc: { $exists: false } },
          {
            $or: [
              {
                'parent_doc.permissions.user': user.id,
                'parent_doc.permissions.permission': PermissionLevel.EDIT,
              },
              {
                'parent_doc.permissions.user': user.id,
                'parent_doc.permissions.permission': PermissionLevel.VIEW,
              },
            ],
          },
        ],
      })
      .project({ parent_doc: false })

    return fields
  }

  async getField(
    user: User,
    id: FieldId,
    perms: PermissionLevel[] = [PermissionLevel.EDIT, PermissionLevel.VIEW]
  ): Promise<FieldDocument | null> {
    // Find field that user has edit or view permission in container and field itself
    // or field that doesn't have permissions (i.e. just text input)
    const field = await this.fieldModel
      .findOne<FieldDocument>({
        _id: id,
        $or: [
          {
            permissions: {
              $elemMatch: {
                $or: [
                  perms.map((perm) => ({
                    user: user.id,
                    permission: perm,
                  })),
                ],
              },
            },
          },
          { permissions: { $exists: false } },
        ],
      })
      .populate([
        {
          path: 'fields',
          match: {
            $or: [
              {
                permissions: {
                  $elemMatch: {
                    $or: [
                      {
                        user: user.id,
                        permission: PermissionLevel.EDIT,
                      },
                      {
                        user: user.id,
                        permission: PermissionLevel.VIEW,
                      },
                    ],
                  },
                },
              },
              { permissions: { $exists: false } },
            ],
          },
        },
        {
          path: 'parent',
          match: {
            $or: [
              {
                permissions: {
                  $elemMatch: {
                    $or: [
                      perms.map((perm) => ({
                        user: user.id,
                        permission: perm,
                      })),
                    ],
                  },
                },
              },
              { permissions: { $exists: false } },
            ],
          },
        },
      ])

    if (!field) {
      return null
    }

    if (field.parent === null) {
      throw new Error(
        `Parent field not found or user does not have edit permission`
      )
    }

    return field

    // Alternative implementation with aggregation

    // const field = await this.fieldModel
    //   .aggregate<FieldContainerDocument | FieldTextInputDocument>()
    //   .match({
    //     $expr: { $eq: ['$_id', { $toObjectId: id }] },
    //     $or: [
    //       { permissions: { $exists: false } },
    //       {
    //         permissions: {
    //           $elemMatch: {
    //             $or: [
    //               {
    //                 user: user.id,
    //                 permission: PermissionLevel.EDIT,
    //               },
    //               {
    //                 user: user.id,
    //                 permission: PermissionLevel.VIEW,
    //               },
    //             ],
    //           },
    //         },
    //       },
    //     ],
    //   })
    //   .lookup({
    //     from: 'fields',
    //     localField: 'parent',
    //     foreignField: '_id',
    //     as: 'parent_doc',
    //   })
    //   .unwind({ path: '$parent_doc', preserveNullAndEmptyArrays: true })
    //   .match({
    //     $or: [
    //       { parent_doc: { $exists: false } },
    //       {
    //         $or: [
    //           {
    //             'parent_doc.permissions.user': user.id,
    //             'parent_doc.permissions.permission': PermissionLevel.EDIT,
    //           },
    //           {
    //             'parent_doc.permissions.user': user.id,
    //             'parent_doc.permissions.permission': PermissionLevel.VIEW,
    //           },
    //         ],
    //       },
    //     ],
    //   })
    //   .project({ parent_doc: false })
    //   .lookup({
    //     from: 'fields',
    //     localField: 'fields',
    //     foreignField: '_id',
    //     pipeline: [
    //       {
    //         $match: {
    //           $or: [
    //             { permissions: { $exists: false } },
    //             {
    //               $or: [
    //                 {
    //                   'permissions.user': user.id,
    //                   'permissions.permission': PermissionLevel.EDIT,
    //                 },
    //                 {
    //                   'permissions.user': user.id,
    //                   'permissions.permission': PermissionLevel.VIEW,
    //                 },
    //               ],
    //             },
    //           ],
    //         },
    //       },
    //     ],
    //     as: 'fields',
    //   })
    //   .limit(1)

    // if (!field.length) {
    //   return null
    // }

    // return field[0]
  }

  async addField(
    user: User,
    createFieldDto: CreateFieldDto
  ): Promise<FieldDocument> {
    // Create field with user as owner
    const newField: FieldDocument = new this.fieldModel({
      ...createFieldDto,
      ...(createFieldDto.type === FieldType.CONTAINER && {
        permissions: [
          {
            user: user.id,
            permission: PermissionLevel.EDIT,
          },
          ...(createFieldDto.permissions ?? []),
        ],
      }),
    })

    // Populate document and check if it exists
    await newField.populate(['document'])
    if (!newField.document) {
      throw new Error(`Document not found`)
    }

    // Add field to parent container if it exists and check if it in the same document
    if (newField.parent) {
      const parentContainerField =
        await this.fieldModel.findOne<FieldContainerDocument>({
          _id: newField.parent._id,
          permissions: {
            $elemMatch: {
              user: user.id,
              permission: PermissionLevel.EDIT,
            },
          },
        })
      if (!parentContainerField) {
        throw new Error(
          `Parent field not found or user does not have edit permission`
        )
      }

      if (!parentContainerField.document._id.equals(newField.document._id)) {
        throw new Error(`Parent field is not in the same document`)
      }

      parentContainerField.fields.push(newField)
      await parentContainerField.save()
    }

    // Add field to document
    newField.document.fields.push(newField._id)
    await newField.document.save()

    await newField.save()

    return newField
  }

  async updateField(
    user: User,
    id: FieldId,
    updateFieldDto: UpdateFieldDto
  ): Promise<FieldDocument | null> {
    // Find field, check if user has edit permission to it and it's parent and update it
    const field = await this.getField(user, id, [PermissionLevel.EDIT])
    if (!field) {
      throw new Error(`Field not found or user does not have edit permission`)
    }

    const updatedField = await this.fieldModel.findByIdAndUpdate<FieldDocument>(
      id,
      updateFieldDto,
      {
        setDefaultsOnInsert: true,
      }
    )

    if (!updatedField) {
      return null
    }

    return updatedField
  }

  async removeField(user: User, id: FieldId): Promise<FieldDocument | null> {
    // Find field, check if user has edit permission to it and it's parent and remove it
    const field = await this.getField(user, id, [PermissionLevel.EDIT])
    if (!field) {
      throw new Error(`Field not found or user does not have edit permission`)
    }

    const deletedField = await this.fieldModel.findByIdAndDelete<FieldDocument>(
      {
        _id: id,
      }
    )

    if (!deletedField) {
      return null
    }

    // Remove field from parent document
    if (deletedField.parent) {
      const parentContainerField =
        await this.fieldModel.findByIdAndUpdate<FieldContainerDocument>(
          deletedField.parent,
          {
            $pull: {
              fields: deletedField._id,
            },
          }
        )
      if (!parentContainerField) {
        throw new Error(`Parent field not found`)
      }
    }

    // Remove field from document
    await deletedField.populate('document')
    if (!deletedField.document) {
      throw new Error(`Document not found`)
    }
    deletedField.document.fields.filter((f) => !f._id.equals(deletedField._id))
    await deletedField.document.save()

    return deletedField
  }
}
