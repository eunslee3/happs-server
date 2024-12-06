import { Controller } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('signup')
  async signup(@Body signupDto: SignupDto): Promise<any> {
    // Include signup method from auth.service
  }
}
