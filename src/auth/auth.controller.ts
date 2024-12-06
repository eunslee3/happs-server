import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

type SignupDto = {
  email: string;
  password: string;
};

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<any> {
    // Include signup method from auth.service
    const hashedPassword = await this.authService.signup(signupDto)
    console.log('hashedPassword', hashedPassword)
    return (
      { 
        email: signupDto.email, 
        password: hashedPassword, 
        message: 'Signup successful' 
      } as any
    );
  }
}
