import {
  Injectable,
  BadRequestException,
  Inject,
  Scope,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
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
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable({ scope: Scope.REQUEST }) // This allows the request object to be accessible accross the service
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
    @Inject(REQUEST) private req: Request, // Dependency Injection of the request object in the class
  ) {}

  async createUser({ name, email, hashedPassword }): Promise<User> {
    email = email.toLowerCase();
    const newUser = new this.usersModel({
      name,
      email,
      password: hashedPassword,
      roles: [Role.ADMIN],
    });
    await newUser.save();
    return newUser;
  }

  async getUser(id: string): Promise<SerializedUser> {
    try {
      const user = await this.usersModel.findById(id);
      if (!user) {
        throw new NotFoundException();
      }
      return this.sanitizeNoToken(user);
    } catch (error) {
      throw new InternalServerErrorException();
    }
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
      throw new InternalServerErrorException();
    }
  }

  async updateUserProfile(
    updateUserDto: UpdateUserDto,
  ): Promise<SerializedUser> {
    const { _id } = this.req['user'];
    console.log('here');
    try {
      const hash = await bcrypt.hash(updateUserDto.password, 9);
      console.log(hash);
      updateUserDto.password = hash;
      const user = await this.usersModel.findByIdAndUpdate(_id, updateUserDto, {
        new: true,
      });
      if (!user) {
        throw new UnauthorizedException();
      }

      return this.sanitizeNoToken(user);
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async deleteUser(): Promise<SerializedUser> {
    const { _id } = this.req['user'];
    try {
      const user = await this.usersModel.findByIdAndDelete(_id);
      if (!user) {
        throw new UnauthorizedException();
      }

      return this.sanitizeNoToken(user);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async logOut() {
    const { _id } = this.req['user'];
    const access_token = this.req['access_token'];
    try {
      const user = await this.usersModel.findOneAndUpdate(
        { _id },
        { $pull: { tokens: { access_token } } },
        { new: true },
      );
      return this.sanitizeNoToken(user);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async logOutAll() {
    const { _id } = this.req['user'];
    try {
      const user = await this.usersModel.findOneAndUpdate(
        { _id },
        { $set: { tokens: [] } },
        { new: true },
      );
      return this.sanitizeNoToken(user);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findByCredentials(email: string, password: string): Promise<User> {
    const user = await this.usersModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Incorrect details!');
    }
    const isMatch = await bcrypt.compare(password, user.password);

    console.log(isMatch, password, user.password);
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
