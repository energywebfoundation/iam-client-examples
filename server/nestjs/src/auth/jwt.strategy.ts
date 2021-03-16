import * as fs from 'fs';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          if (req && req.cookies) {
            return req.cookies.auth as string;
          }
          return undefined;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: fs.readFileSync('public.pem'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
