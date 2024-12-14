import { Injectable } from '@nestjs/common';
import { UpdateUserInfoDto } from './dto/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByGoogleId(googleId: string) {
    return this.prismaService.user.findUnique({
      where: { googleId: googleId },
    });
  }
  
  // Create logic for OAuth signup
  async create(userData: any) {
    return this.prismaService.user.create({
      data: {
        googleId: userData.googleId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        hashedPassword: null
      }
    });
  }

  async updateUserInfo(updateUserInfoDto: UpdateUserInfoDto): Promise<any> {
    const user = await this.prismaService.user.findUnique({ where: { id: updateUserInfoDto.id }})
    if (!user) {
      console.error('User not found');
      return({
        status: 400,
        message: 'User not found'
      });
    };

    try {
      const updatedUser = await this.prismaService.user.update({
        where: { id: updateUserInfoDto.id },
        data: {
          ...updateUserInfoDto
        }
      });
      delete updatedUser.hashedPassword;
      return {
        status: 200,
        message: 'User info updated successfully',
        data: updatedUser
      };
    } catch (err) {
      console.error('Failed to update user info', err);
      return({
        status: 500,
        message: 'Failed to update user info'
      });
    }
  }
}
