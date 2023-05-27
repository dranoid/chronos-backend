import { Injectable, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Role } from './entities/role.enum';
import { SanitizeUserDto } from './dto/sanitize-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
  ) {}

  async createUser({ name, email, hashedPassword }): Promise<User> {
    const newUser = new this.usersModel({
      name,
      email,
      password: hashedPassword,
      roles: [Role.USER],
    });
    await newUser.save();
    return newUser;
  }

  async findByCredentials(email: string, password: string): Promise<User> {
    const user = await this.usersModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Incorrect details!');
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Incorrect details!');
    }

    return user;
  }

  sanitizeUserObj(
    user: User,
    token: string,
  ): { user: SanitizeUserDto; access_token: string } {
    const { name, email, order, roles } = user;
    const _id = user['_id'];
    return { user: { _id, name, email, order, roles }, access_token: token };
  }

  async getAllUsers(): Promise<User[]> {
    return await this.usersModel.find();
  }
}
