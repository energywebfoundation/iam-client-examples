const fs = require('fs');
const passport = require('passport');
const { LoginStrategy } = require('passport-did-auth');
const { ExtractJwt, Strategy } = require('passport-jwt');

const LOGIN_STRATEGY = 'login';
const public_pem = fs.readFileSync('public.pem');
const private_secret = fs.readFileSync('private.pem');
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    (req) => {
      if (req && req.cookies) {
        return req.cookies.auth;
      }
      return undefined;
    },
  ]),
  ignoreExpiration: false,
  secretOrKey: public_pem,
  algorithms: ['RS256'],
};

module.exports.preparePassport = () => {
  passport.use(new LoginStrategy({
    jwtSecret: private_secret,
    jwtSignOptions: {
      algorithm: 'RS256',
    },
    name: LOGIN_STRATEGY,
    rpcUrl: process.env.RPC_URL || 'https://volta-rpc.energyweb.org/',
    cacheServerUrl: process.env.CACHE_SERVER_URL || 'https://identitycache-dev.energyweb.org/v1',
    acceptedRoles: process.env.ACCEPTED_ROLES ? process.env.ACCEPTED_ROLES.split(',') : [],
    privateKey: 'eab5e5ccb983fad7bf7f5cb6b475a7aea95eff0c6523291b0c0ae38b5855459c',
  }));
  passport.use(new Strategy(jwtOptions, function (payload, done) {
    return done(null, payload)
  }));
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });
  return { passport, LOGIN_STRATEGY };
}
