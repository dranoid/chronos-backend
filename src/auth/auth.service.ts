import { Injectable, ConflictException } from '@nestjs/common';
import { User } from 'src/users/schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Save user details and hash password
      const { password, email, name } = createUserDto;
      const hashedPassword = this.hashPassword(password);
      const newUser = new this.usersModel({
        name,
        email,
        hashedPassword,
      });
      return await newUser.save();
    } catch (error) {
      if (
        error.code == 11000 &&
        error.keyPattern &&
        error.keyPattern.email == 1
      )
        throw new ConflictException('Email already exists');
    }
  }

  async hashPassword(plaintext: string): Promise<string> {
    return await bcrypt.hash(plaintext, 9);
  }

  async generateAuthToken() {
    //
  }
}
