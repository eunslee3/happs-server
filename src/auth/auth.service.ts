import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password/password.service';
import * as bcrypt from 'bcrypt';
import { SignupDto, PendingUser, LoginDto } from './dto/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
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

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    try {
      const user = await this.passwordService.decrpytHash(email, password);
      return user
    } catch (err) {
      console.error(`Error: ${err}`);
      return({
        status: 400,
        message: `Failed to login user ${err.message}`
      })
    }
  }
}
