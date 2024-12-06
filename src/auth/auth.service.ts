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

      const hashedPassword = await bcrypt.hash(password, 10)
      return hashedPassword
  }
}
