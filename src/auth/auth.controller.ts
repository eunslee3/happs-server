import { Controller, Post, Body, HttpCode, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';
import { PasswordService } from './password/password.service';
import { SignupDto, SendVerificationTokenDto, VerifyOtpDto, LoginDto } from './dto/dto';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly prismaService: PrismaService,
  ) {}
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // This route will automatically redirect the user to Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req, @Res() res) {
    // The user object is attached to req.user by GoogleStrategy
    const user = req.user;

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken({ userId: user.id });
    const refreshToken = this.tokenService.generateRefreshToken({ userId: user.id });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prismaService.user.update({
      where: { email: user.email },
      data: {
        refreshToken: hashedRefreshToken
      }
    })
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return res.json({
      message: 'Google login successful',
      user,
      accessToken,
    });
  }

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
