import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { LoginUserDto } from './users/dto/login-user.dto';
import { User } from './users/interfaces/user.interface';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signupUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.createUser(createUserDto);
  }
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    // here's the login logic
  }
}
