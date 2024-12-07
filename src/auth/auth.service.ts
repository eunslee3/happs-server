import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

type SignupDto = {
  email: string;
  password: string;
}

type sendVerificationTokenDto = {
  email?: string;
  phoneNumber?: string;
};

type PendingUser = {
  email: string;
  password: string;
  createdAt: Date;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(signupDto: SignupDto): Promise<PendingUser> {
    const { email, password } = signupDto;

    const userExists = await this.prismaService.user.findUnique({ where: { email }})
    if (userExists) {
      throw new Error('Email already in use');
    }

    // Hash the password and store in pending users list
    const hashedPassword = await bcrypt.hash(password, 10)

    // Set the expiration time for the pending user
    const expiresAt = new Date
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    return await this.prismaService.pendingUser.create({
      data: {
        email: email,
        password: hashedPassword,
        expiresAt: expiresAt,
      },
    })
  }

  async sendVerificationToken(sendVerificationTokenDto: sendVerificationTokenDto): Promise<any> {
    const { email, password } = sendVerificationTokenDto;
    console.log(email, password)
  }
}
