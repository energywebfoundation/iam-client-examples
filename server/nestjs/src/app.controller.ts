import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { LoginGuard } from './auth/auth.guard';
import { CookieOptions, Request, Response } from 'express';
import { JwtAuthGuard } from './auth/jwt.guard';
import * as useragent from 'useragent';
import { CookiesServices } from './auth/cookies.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private cookiesService: CookiesServices,
    private configService: ConfigService,
  ) {}

  @UseGuards(LoginGuard)
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    const isProduction =
      this.configService.get<string>('NODE_ENV)') === 'production';

    const cookiesOptions = isProduction
      ? this.cookiesService.getCookiesOptionBasedOnUserAgent(
          req.headers['user-agent'],
        )
      : { httpOnly: true };

    res.cookie('auth', req.user, cookiesOptions);

    return res.send({ token: req.user });
  }

  @UseGuards(JwtAuthGuard)
  @Get('roles')
  getRoles(@Req() req: Request, @Res() res: Response) {
    const { verifiedRoles } = req.user as {
      verifiedRoles: { name: string; namespace: string }[];
      did: string;
    };
    res.send(verifiedRoles);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getUser(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('login-status')
  isLoggedIn(@Req() req: Request, @Res() res: Response) {
    const user = req.user as {
      did: string;
      verifiedRoles: [];
      iat: number;
      exp?: number;
    };

    if (user) {
      const { did, exp } = user;
      return res.send({ loginStatus: true, did, tokenExpiryDate: exp });
    }

    return res.send({ loginStatus: false });
  }
}
