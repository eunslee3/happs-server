import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

type SignupDto = {
  email: string;
  password: string;
};

type SendVerificationTokenDto = {
  id: string;
  email?: string;
  phoneNumber?: string;
};

type VerifyTokenDto = {
  id: string;
  tokenInput: number;
};

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<any> {
    // Include signup method from auth.service
    return await this.authService.signup(signupDto)
  }

  @Post('send-otp')
  @HttpCode(200)
  async sendVerificationToken(@Body() sendVerificationTokenDto: SendVerificationTokenDto): Promise<any> {
    // call service method
    return await this.authService.sendVerificationToken(sendVerificationTokenDto)
  }

  @Post('verify-token')
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto): Promise<any> {
    // call service method
    return await this.authService.verifyToken(verifyTokenDto)
  }
}
