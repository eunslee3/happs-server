import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password/password.service';
import { TokenService } from './token/token.service';
import { SignupDto, PendingUser, LoginDto } from './dto/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(signupDto: SignupDto): Promise<PendingUser | any> {
    const { email, password } = signupDto;

    const userExists = await this.prismaService.user.findUnique({ where: { email }})
    if (userExists) {
      console.error('Email already in use');
      return ({
        message: 'Email already in use',
        status: 400
      })
    }

    try {
      // Hash the password and store in pending users list
      const hashedPassword = await this.passwordService.generateHash(password)

      return await this.prismaService.pendingUser.create({
        data: {
          email: email,
          hashedPassword: hashedPassword,
          verificationToken: null
        },
      })
    } catch (err) {
      console.error(`Error: ${err.message}`);
      return({
        status: 400,
        message: `Failed to create pending user ${err.message}`
      })
    }
  }

  async validateUser(loginDto: LoginDto): Promise<any> {
    try {
      const user = await this.passwordService.decrpytHash(loginDto);
      return user
    } catch (err) {
      return {
        status: 400,
        message: `Failed to validate user ${err.message}`
      }
    }
  }

  async login(userId: string): Promise<any> {
    try {
      const accessToken = this.tokenService.generateAccessToken(userId);
      const refreshToken = this.tokenService.generateRefreshToken(userId);
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          refreshToken
        }
      })
      return { refreshToken, accessToken };
    } catch (err) {
      console.error(`Error: ${err}`);
      return({
        status: 400,
        message: `Failed to login user ${err.message}`
      })
    }
  }

  

  async logout(userId: string): Promise<any> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        refreshToken: null
      }
    })
  }
}
