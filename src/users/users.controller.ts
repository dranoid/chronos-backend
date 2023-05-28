import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SerializedUser } from './interfaces/user.interface';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { Role } from './entities/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  getAllUsers(): Promise<SerializedUser[]> {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUserProfile() {
    return this.usersService.getUserProfile();
  }

  @Put('me')
  updateUserProfile() {}

  @Delete('me')
  deleteUserProfile() {}

  // Admin
  // Nest's ordering issue, it will treat me as an id if it's above
  @Get(':id')
  getOneUser(@Param('id') id: string) {}
}
