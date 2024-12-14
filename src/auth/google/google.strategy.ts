import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_REDIRECT_URI'),
      scope: ['email', 'profile'], // Request user's email and profile info
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const { id, name, emails } = profile;

    // Check if user exists
    let user = await this.userService.findByGoogleId(id);
    if (!user) {
      // Create new user if not found
      user = await this.userService.create({
        googleId: id,
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName
      });
    }

    return user; // Pass user object to the request
  }
  
}
