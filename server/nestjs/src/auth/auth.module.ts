import { Module } from '@nestjs/common';
import { AuthStrategy } from './auth.strategy';
import { CookiesServices } from './cookies.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  providers: [AuthStrategy, JwtStrategy, CookiesServices],
  exports: [CookiesServices],
})
export class AuthModule {}
