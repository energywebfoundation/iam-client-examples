import { LoginStrategy } from 'passport-did-auth';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class AuthStrategy extends PassportStrategy(LoginStrategy, 'login') {
  constructor() {
    const acceptedRoles = process.env.ACCEPTED_ROLES ? process.env.ACCEPTED_ROLES.split(',') : [];
    super({
      jwtSecret: 'secret',
      name: 'login',
      rpcUrl: 'https://volta-rpc.energyweb.org/',
      cacheServerUrl: 'https://volta-iam-cacheserver.energyweb.org/',
      acceptedRoles
    });
  }
}
