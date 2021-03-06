import { LoginStrategy } from 'passport-did-auth';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as fs from 'fs';

@Injectable()
export class AuthStrategy extends PassportStrategy(LoginStrategy, 'login') {
  constructor() {
    const acceptedRoles = process.env.ACCEPTED_ROLES
      ? process.env.ACCEPTED_ROLES.split(',')
      : [];
    super({
      jwtSecret: fs.readFileSync('private.pem'),
      jwtSignOptions: {
        algorithm: 'RS256',
      },
      rpcUrl: process.env.RPC_URL || 'https://volta-rpc.energyweb.org/',
      cacheServerUrl:
        process.env.CACHE_SERVER_URL ||
        'https://identitycache-dev.energyweb.org/',
      acceptedRoles,
      privateKey:
        'eab5e5ccb983fad7bf7f5cb6b475a7aea95eff0c6523291b0c0ae38b5855459c',
    });
  }
}
