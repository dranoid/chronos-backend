import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { LoginUserDto } from './users/dto/login-user.dto';
import { SanitizeUserDto } from './users/dto/sanitize-user.dto';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signupUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ user: SanitizeUserDto; access_token: string }> {
    return this.authService.createUser(createUserDto);
  }
  @Post('login')
  loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ user: SanitizeUserDto; access_token: string }> {
    return this.authService.loginUser(loginUserDto);
  }
}
