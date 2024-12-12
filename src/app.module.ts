import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    DevtoolsModule.register({
      http: true
    }),
    AuthModule, 
    UsersModule, 
    PrismaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
