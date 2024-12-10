import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PasswordService {
  constructor(private readonly prismaService: PrismaService) {}
  async generateHash(password: string): Promise<any> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      return hashedPassword;
    } catch (err) {
      console.error(err);
      return { status: 400, message: err.message };
    }
  }

  async decrpytHash(email: string, password: string): Promise<any> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
        select: { hashedPassword: true },
      })
      const { hashedPassword, ...userWithoutPassword } = user;
      const isAuthenticated = await bcrypt.compare(password, hashedPassword);
      return isAuthenticated ? userWithoutPassword : { status: 401, message: 'Invalid credentials' };
    } catch (error) {
      throw new Error('Invalid password');
    }
  }
}
