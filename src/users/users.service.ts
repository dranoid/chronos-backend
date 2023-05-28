import {
  Injectable,
  BadRequestException,
  Inject,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Role } from './entities/role.enum';
import { SerializedUser } from './interfaces/user.interface';
import { plainToClass } from '@nestjs/class-transformer';
import * as bcrypt from 'bcrypt';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST }) // This allows the request object to be accessible accross the service
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
    @Inject(REQUEST) private req: Request, // Dependency Injection of the request object in the class
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

  async getUserProfile(): Promise<SerializedUser> {
    const { _id } = this.req['user'];
    try {
      const user = await this.usersModel.findById(_id);
      if (!user) {
        throw new UnauthorizedException();
      }
      return this.sanitizeNoToken(user);
    } catch (error) {
      throw new UnauthorizedException();
    }
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
  ): { user: SerializedUser; access_token: string } {
    const sUser = plainToClass(SerializedUser, user.toObject());
    return { user: sUser, access_token: token };
  }
  sanitizeUsers(users: User[]): SerializedUser[] {
    const sanitized = users.map((user) =>
      plainToClass(SerializedUser, user.toObject()),
    );
    return sanitized;
  }

  sanitizeNoToken(user: User): SerializedUser {
    return plainToClass(SerializedUser, user.toObject());
  }

  async getAllUsers(): Promise<SerializedUser[]> {
    const users = await this.usersModel.find();
    return this.sanitizeUsers(users);
  }
}
