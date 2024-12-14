import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VerifyOtpDto, SendVerificationTokenDto } from '../dto/dto';
import { handleSendVerificationToken } from 'src/utility/handleSendVerificationToken';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const minutesForTimeout = {
  1: 0.5,
  2: 1,
  3: 5,
  4: 30,
  5: 60
}

@Injectable()
export class TokenService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(userId: any) {
    return this.jwtService.sign({ userId });
  }

  generateRefreshToken(userId: any) {
    const refreshSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    return this.jwtService.sign(
      { userId },
      { secret: refreshSecret, expiresIn: '7d' },
    );
  }

  validateRefreshToken(token: string) {
    const refreshSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    return this.jwtService.verify(token, { secret: refreshSecret });
  }

  async sendVerificationToken(sendVerificationTokenDto: SendVerificationTokenDto): Promise<any> {
    const { id, email, phoneNumber } = sendVerificationTokenDto;
    const pendingUser = await this.prismaService.pendingUser.findUnique({ where: { id } });
    const currentTime = new Date();
    const expiresAt = new Date;
    const expiryDate = new Date;

    // Check if user is locked out before executing request
    if (
      pendingUser?.timeoutForToken && 
      pendingUser?.timeoutForToken > currentTime
    ) {
      console.error('User is locked until timeout is over');
      return({
        message: 'User is locked until timeout is over',
        status: 400
      });
    };

    if (pendingUser.amountOfVerificationTokensSent > 2) {
      console.error('User has reached maximum number of tokens sent. Setting timeout.');
      const numberOfTimeoutsForTokens = pendingUser.numberOfTimeoutsForTokens === 5 ? pendingUser.numberOfTimeoutsForTokens : pendingUser.numberOfTimeoutsForTokens + 1;
      // Check if the user's timeouts has reached 4. We'll keep it at that value
      // and keep the duration of the timeout at an hour
      const timeForTimeout = minutesForTimeout[numberOfTimeoutsForTokens];
      const timeoutForToken = new Date(expiryDate.setMinutes(expiryDate.getMinutes() + timeForTimeout));
      await this.prismaService.pendingUser.update({ 
        where: { 
          id: id 
        }, 
        data: {
          timeoutForToken,
          numberOfTimeoutsForTokens,
          amountOfVerificationTokensSent: 0 // reset attempts
        }
      });
      console.error(`Locking out user for ${timeForTimeout} minutes`);
      return ({
        message: `Locking out user for ${timeForTimeout} minutes`,
        status: 400
      });
    }

    try {
      // Set the expiration time for the verification token
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      // Generate random numeric token
      const randomBytes = crypto.randomBytes(3);
      const token = parseInt(randomBytes.toString('hex'), 16);
      await this.prismaService.pendingUser.update({
        where: { id: id },
        data: { 
          verificationToken: token, 
          expiresAt: expiresAt, 
          amountOfVerificationTokensSent: { increment: 1 } 
        },
      })

      return handleSendVerificationToken(email, phoneNumber, token);
    } catch (err) {
      console.error(err)
      throw new Error('Failed to send verification token');
    }
  }

  async verifyToken(verifyOtpDto: VerifyOtpDto): Promise<any> {
    const { id, tokenInput } = verifyOtpDto;
    const currentDate = new Date();
    const expiryDate = new Date();
    const pendingUser = await this.prismaService.pendingUser.findUnique({ where: { id } });
    const { verificationToken, expiresAt, email, hashedPassword,  } = pendingUser;

    if (
      pendingUser?.timeoutForAttempts && 
      pendingUser?.timeoutForAttempts > currentDate
    ) {
      console.error('User is locked until timeout is over');
      return({
        message: 'User is locked until timeout is over',
        status: 400
      });
    };

    if (expiresAt < currentDate) {
      console.error(`Verification token has expired`);
      return ({ 
        message: "Verification token has expired", 
        status: 400
      })
    }      

    if (pendingUser.attempts > 4) {
      console.error('User has reached maximum attempts. Setting timeout.');
      const numberOfTimeoutsForAttempts = pendingUser.numberOfTimeoutsForAttempts === 5 ? pendingUser.numberOfTimeoutsForAttempts : pendingUser.numberOfTimeoutsForAttempts + 1;
      // Check if the user's timeouts has reached 4. We'll keep it at that value
      // and keep the duration of the timeout at an hour
      const timeForTimeout = minutesForTimeout[numberOfTimeoutsForAttempts];
      const timeoutForAttempts = new Date(expiryDate.setMinutes(expiryDate.getMinutes() + timeForTimeout));
      await this.prismaService.pendingUser.update({ 
        where: { 
          id: id 
        }, 
        data: {
          timeoutForAttempts,
          numberOfTimeoutsForAttempts,
          attempts: 0 // reset attempts
        }
      });
      console.error(`Locking out user for ${timeForTimeout} minutes`);
      return ({
        message: `Locking out user for ${timeForTimeout} minutes`,
        status: 400
      });
    };

    if (verificationToken !== tokenInput) {
      console.error(`Verification token does not match`);
      await this.prismaService.pendingUser.update({
        where: { id: id }, 
        data: {
          attempts: { increment: 1 }
        }
      })
      return ({ 
        message: "Verification token does not match", 
        status: 400
      })
    } 
    else {
      // Create the bare minimum user. We will update this with further registration information
      const createdUser = await this.prismaService.user.create({
        data: {
          email: email,
          hashedPassword: hashedPassword,
          isVerified: true
        }
      });
      return ({
        status: 201,
        message: "User registered successfully",
        data: { createdUser }
      });
    }
  }
}
