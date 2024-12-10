import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';
import { PasswordService } from './password/password.service';
import { SignupDto, SendVerificationTokenDto, VerifyTokenDto, LoginDto } from './dto/dto';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService
  ) {}
  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<any> {
    // Include signup method from auth.service
    return await this.authService.signup(signupDto)
  }

  @Post('send-otp')
  @HttpCode(200)
  async sendVerificationToken(@Body() sendVerificationTokenDto: SendVerificationTokenDto): Promise<any> {
    // call service method
    return await this.tokenService.sendVerificationToken(sendVerificationTokenDto)
  }

  @Post('verify-token')
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto): Promise<any> {
    // call service method
    return await this.tokenService.verifyToken(verifyTokenDto)
  }

  @Post('authenticate-user')
  async authenticateUser(@Body() loginDto: LoginDto): Promise<any> {
    return await this.authService.login(loginDto)
  }
}
