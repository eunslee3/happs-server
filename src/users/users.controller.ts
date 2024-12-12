import { Controller, Patch, Body } from '@nestjs/common';
import { UpdateUserInfoDto } from './dto/dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Patch('update-user-info')
  async updateUser (@Body() updateUserDto: UpdateUserInfoDto): Promise<any> {
    return await this.usersService.updateUserInfo(updateUserDto);
  }
}
