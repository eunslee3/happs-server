import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenService } from './token/token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasswordService } from './password/password.service';
import { RegistrationService } from './registration/registration.service';
import { GoogleStrategy } from './google/google.strategy';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, TokenService, PasswordService, RegistrationService, GoogleStrategy],
  imports: [
    PrismaModule,
    ConfigModule.forRoot(), // Load environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule], // Ensure ConfigService is available
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'), // JWT secret
        signOptions: { expiresIn: '15m' }, // Token expiration
      }),
    }),
  ]
})
export class AuthModule {}
