import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { LoginGuard } from './auth/auth.guard';
import { CookieOptions, Request, Response } from 'express';
import { JwtAuthGuard } from './auth/jwt.guard';
import * as useragent from 'useragent';

@Controller()
export class AppController {
  constructor() {}

  @UseGuards(LoginGuard)
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    const cookiesOptions: CookieOptions = {
      httpOnly: true,
      // sameSite: 'none',
      // secure: true,
    };
    const { family, major } = useragent.parse(req.headers['user-agent']) || {};
    if (family === 'Chrome' && +major >= 51 && +major <= 66) {
      delete cookiesOptions.sameSite;
      delete cookiesOptions.secure;
    }
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
}
