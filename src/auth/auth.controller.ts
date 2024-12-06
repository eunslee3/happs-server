import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

type SignupDto = {
  email: string;
  password: string;
};

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<any> {
    // Include signup method from auth.service
    return await this.authService.signup(signupDto)
  }
}
