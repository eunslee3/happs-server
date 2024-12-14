import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';
import { PasswordService } from './password/password.service';
import { SignupDto, SendVerificationTokenDto, VerifyOtpDto, LoginDto } from './dto/dto';
import { UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService
  ) {}
  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<any> {
    return await this.authService.signup(signupDto)
  }

  @Post('send-otp')
  @HttpCode(200)
  async sendVerificationToken(@Body() sendVerificationTokenDto: SendVerificationTokenDto): Promise<any> {
    return await this.tokenService.sendVerificationToken(sendVerificationTokenDto)
  }

  @Post('verify-otp')
  async verifyToken(@Body() verifyOtpDto: VerifyOtpDto): Promise<any> {
    return await this.tokenService.verifyToken(verifyOtpDto)
  }

  @Post('validate-user')
  async authenticateUser(@Body() loginDto: LoginDto): Promise<any> {
    const user = await this.authService.validateUser(loginDto)
    const tokens = await this.authService.login(user.id);
    const { refreshToken, accessToken } = tokens;

    return {
      status: 200,
      data: {
        ...user,
        refreshToken,
        accessToken
      }
    }
  }

  @Post('logout')
  async logout(@Body() userId: string): Promise<any> {
    return await this.authService.logout(userId)
  }

  @Post('refresh')
  async refresh(@Body() refreshToken: string): Promise<any> {
    try {
      const payload = this.tokenService.validateRefreshToken(refreshToken);
      const userId = payload.userId;

      // Issue new tokens
      const accessToken = this.tokenService.generateAccessToken(userId);
      const newRefreshToken = this.tokenService.generateRefreshToken(userId);

      // Update the refresh token in the database
      await this.authService.login(userId);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
