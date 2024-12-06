import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

type SignupDto = {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(signupDto: SignupDto): Promise<void> {
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

      await this.prismaService.pendingUser.create({
        data: {
          email,
          password: hashedPassword,
          expiresAt: expiresAt,
        },
      })
  }
}
