import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Admin
  @Get()
  getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  // @Post()
  // signupUser(@Body() createUserDto: CreateUserDto): Promise<User> {
  //   return this.usersService.createUser(createUserDto);
  // }

  @Post()
  loginUser() {}

  @Get('me')
  getUserProfile() {}

  @Put('me')
  updateUserProfile() {}

  @Delete('me')
  deleteUserProfile() {}

  // Admin
  // Nest's ordering issue, it will treat me as an id if it's above
  @Get(':id')
  getOneUser(@Param('id') id: string) {}
}
