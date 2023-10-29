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
import type { FieldTextInput } from './schemas/field-text-input.schema'
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
    const fields = await this.fieldModel.find<FieldDocument>({
      $and: [
        {
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
        {
          $or: [
            { parent: { $exists: false } },
            {
              'parent.permissions': {
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
        },
      ],
    })

    return fields
  }

  async getField(user: User, id: FieldId): Promise<FieldDocument | null> {
    // Find field that user has edit or view permission in container and field itself
    // or field that doesn't have permissions (i.e. just text input)
    const field = await this.fieldModel
      .findOne<FieldDocument>({
        _id: id,
        $and: [
          {
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
          {
            $or: [
              { parent: { $exists: false } },
              {
                'parent.permissions': {
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
          },
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
      ])

    if (!field) {
      return null
    }

    return field
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
    const field = await this.fieldModel.findOneAndUpdate<FieldDocument>(
      {
        _id: id,
        permissions: {
          $elemMatch: {
            user: user.id,
            permission: PermissionLevel.EDIT,
          },
        },
        $or: [
          { parent: { $exists: false } },
          {
            'parent.permissions': {
              $elemMatch: {
                user: user.id,
                permission: PermissionLevel.EDIT,
              },
            },
          },
        ],
      },
      updateFieldDto,
      {
        setDefaultsOnInsert: true,
      }
    )

    if (!field) {
      return null
    }

    return field
  }

  async removeField(user: User, id: FieldId): Promise<FieldDocument | null> {
    // Find field, check if user has edit permission to it and it's parent and remove it
    const field = await this.fieldModel.findOneAndDelete<FieldDocument>({
      _id: id,
      permissions: {
        $elemMatch: {
          user: user.id,
          permission: PermissionLevel.EDIT,
        },
      },
      $or: [
        { parent: { $exists: false } },
        {
          'parent.permissions': {
            $elemMatch: {
              user: user.id,
              permission: PermissionLevel.EDIT,
            },
          },
        },
      ],
    })

    if (!field) {
      return null
    }

    // Remove field from parent document
    if (field.parent) {
      const parentContainerField =
        await this.fieldModel.findByIdAndUpdate<FieldContainerDocument>(
          field.parent,
          {
            $pull: {
              fields: field._id,
            },
          }
        )
      if (!parentContainerField) {
        throw new Error(`Parent field not found`)
      }
    }

    // Remove field from document
    await field.populate('document')
    if (!field.document) {
      throw new Error(`Document not found`)
    }
    field.document.fields.filter((f) => !f._id.equals(field._id))
    await field.document.save()

    return field
  }
}
