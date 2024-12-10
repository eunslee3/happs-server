import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from '../dto/dto';

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

  async decrpytHash(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email }
      })
      const { hashedPassword, ...userWithoutPassword } = user;
      const isAuthenticated = await bcrypt.compare(password, hashedPassword);
      return isAuthenticated ? userWithoutPassword : { status: 401, message: 'Invalid credentials' };
    } catch (error) {
      throw new Error('Invalid password');
    }
  }
}
