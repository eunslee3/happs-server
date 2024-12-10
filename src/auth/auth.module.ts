import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenService } from './token/token.service';
import { PasswordService } from './password/password.service';
import { RegistrationService } from './registration/registration.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TokenService, PasswordService, RegistrationService],
  imports: [PrismaModule]
})
export class AuthModule {}
