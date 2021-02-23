import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CookiesServices } from './auth/cookies.service';

@Module({
  imports: [AuthModule, ConfigModule.forRoot()],
  controllers: [AppController],
})
export class AppModule {}
