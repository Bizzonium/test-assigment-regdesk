import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import type {
  CreateUserDto,
  UpdateUserDto,
  User as UserDto,
  Username,
} from '@azizonkg/contracts'

import { User } from './schemas/user.schema'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  private readonly logger = new Logger(UsersService.name)

  async getUsers(): Promise<UserDto[]> {
    const users = await this.userModel.find()

    return users.map((user) => {
      return {
        id: user._id,
        username: user.username,
      }
    })
  }

  async getUser(username: Username): Promise<UserDto | null> {
    const user = await this.userModel.findOne({ username: username })

    if (!user) {
      return null
    }

    return {
      id: user._id,
      username: user.username,
    }
  }

  async addUser(createUserDto: CreateUserDto): Promise<UserDto> {
    const user = new this.userModel(createUserDto)
    await user.save()

    return {
      id: user._id,
      username: user.username,
    }
  }

  async updateUser(
    username: Username,
    updateUserDto: UpdateUserDto
  ): Promise<UserDto | null> {
    const user = await this.userModel.findOneAndUpdate(
      { username: username },
      updateUserDto,
      {
        setDefaultsOnInsert: true,
      }
    )

    if (!user) {
      return null
    }

    return {
      id: user._id,
      username: user.username,
    }
  }

  async removeUser(username: Username): Promise<UserDto | null> {
    const user = await this.userModel.findOneAndDelete({ username: username })

    if (!user) {
      return null
    }

    return {
      id: user._id,
      username: user.username,
    }
  }
}
