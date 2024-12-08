import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { handleSendVerificationToken } from 'src/utility/handleSendVerificationToken';
import * as crypto from 'crypto';

type SignupDto = {
  email: string;
  password: string;
}

type sendVerificationTokenDto = {
  id: string;
  email?: string;
  phoneNumber?: string;
};

type PendingUser = {
  email: string;
  password: string;
  verificationToken?: number;
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

    // TODO: Handle exceptions

    return await this.prismaService.pendingUser.create({
      data: {
        email: email,
        password: hashedPassword,
        verificationToken: null,
        expiresAt: expiresAt,
      },
    })
  }

  async sendVerificationToken(sendVerificationTokenDto: sendVerificationTokenDto): Promise<any> {
    const { id, email, phoneNumber } = sendVerificationTokenDto;

    try {
      // Generate random numeric token
      const randomBytes = crypto.randomBytes(3);
      const token = parseInt(randomBytes.toString('hex'), 16);
      await this.prismaService.pendingUser.update({
        where: { id: id },
        data: { verificationToken: token },
      })

      handleSendVerificationToken(email, phoneNumber, token);
    } catch (err) {
      console.error(err)
      throw new Error('Failed to send verification token');
    }
  }
}
