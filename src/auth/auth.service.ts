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
  hashedPassword: string;
  verificationToken?: number;
  createdAt: Date;
  expiresAt: Date;
}

type VerifyTokenDto = {
  id: string;
  tokenInput: number;
};

const minutesForTimeout = {
  1: 0.5,
  2: 1,
  3: 5,
  4: 30,
  5: 60
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(signupDto: SignupDto): Promise<PendingUser | any> {
    const { email, password } = signupDto;

    const userExists = await this.prismaService.user.findUnique({ where: { email }})
    if (userExists) {
      console.error('Email already in use');
      return ({
        message: 'Email already in use',
        status: 400
      })
    }

    try {
      // Hash the password and store in pending users list
      const hashedPassword = await bcrypt.hash(password, 10)

      return await this.prismaService.pendingUser.create({
        data: {
          email: email,
          hashedPassword: hashedPassword,
          verificationToken: null
        },
      })
    } catch (err) {
      console.error(`Error: ${err.message}`);
      return({
        status: 400,
        message: `Failed to create pending user ${err.message}`
      })
    }
  }

  async sendVerificationToken(sendVerificationTokenDto: sendVerificationTokenDto): Promise<any> {
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

  async verifyToken(verifyTokenDto: VerifyTokenDto): Promise<any> {
    const { id, tokenInput } = verifyTokenDto;
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
      await this.prismaService.user.create({
        data: {
          email: email,
          hashedPassword: hashedPassword,
          isVerified: true
        }
      });
      return ({
        status: 201,
        message: "User registered successfully",
        data: { email: email, isVerified: true }
      });
    }
  }
}
