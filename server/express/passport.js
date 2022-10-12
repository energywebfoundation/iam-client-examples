const fs = require('fs');
const passport = require('passport');
const {
  ethrReg,
  LoginStrategyOptions,
  LoginStrategy,
  Methods,
  ResolverContractType,
  RoleIssuerResolver,
  RoleRevokerResolver,
  RoleCredentialResolver,
  DomainReader,
  VOLTA_CHAIN_ID,
  VOLTA_ENS_REGISTRY_ADDRESS,
  VOLTA_ERC_1056_ADDRESS,
  VOLTA_RESOLVER_V2_ADDRESS,
  DidStore,
} = require('passport-did-auth');
const { ExtractJwt, Strategy } = require('passport-jwt');
const { verifyCredential } = require('didkit-wasm-node');
const { providers } = require('ethers');

const userPrivatekey = 'eab5e5ccb983fad7bf7f5cb6b475a7aea95eff0c6523291b0c0ae38b5855459c';
const cacheServerUrl = 'https://identitycache-dev.energyweb.org/v1';
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

const provider = new providers.JsonRpcProvider(
  'https://volta-rpc.energyweb.org/'
);
const IPFS_HOST = 'ipfs.infura.io';
const IPFS_PORT = 5001;
const IPFS_PROJECTID = '2DTpW5Ddx5odgzd8tY1lzPCRSeF';
const IPFS_PROJECTSECRET = 'f0b2110757d2c0642c5d7a62ed84d9bf';

const auth =
  'Basic ' +
  Buffer.from(IPFS_PROJECTID + ':' + IPFS_PROJECTSECRET).toString('base64');

const didRegistryAddress = VOLTA_ERC_1056_ADDRESS;
const ensRegistryAddress = VOLTA_ENS_REGISTRY_ADDRESS;
const ensResolverAddress = VOLTA_RESOLVER_V2_ADDRESS;

const domainReader = new DomainReader({
  ensRegistryAddress: ensRegistryAddress,
  provider: provider,
});
domainReader.addKnownResolver({
  chainId: VOLTA_CHAIN_ID,
  address: ensResolverAddress,
  type: ResolverContractType.RoleDefinitionResolver_v2,
});

const registrySettings = {
  abi: ethrReg.abi,
  address: didRegistryAddress,
  method: Methods.Erc1056,
};
const didStore = new DidStore('https://ewipfsgwtest.infura-ipfs.io');

const issuerResolver = new RoleIssuerResolver(domainReader, provider, userPrivatekey, cacheServerUrl);
const revokerResolver = new RoleRevokerResolver(domainReader, provider, userPrivatekey, cacheServerUrl);
const credentialResolver = new RoleCredentialResolver(
  provider,
  registrySettings,
  didStore,
  userPrivatekey,
  cacheServerUrl
);

module.exports.preparePassport = () => {
  passport.use(
    new LoginStrategy(
      {
        jwtSecret: private_secret,
        jwtSignOptions: {
          algorithm: 'RS256',
        },
        name: LOGIN_STRATEGY,
        rpcUrl: process.env.RPC_URL || 'https://volta-rpc.energyweb.org/',
        cacheServerUrl:
          process.env.CACHE_SERVER_URL ||
          cacheServerUrl,
        acceptedRoles: process.env.ACCEPTED_ROLES
          ? process.env.ACCEPTED_ROLES.split(',')
          : [],
        privateKey: userPrivatekey,
        didContractAddress:
          process.env.DID_REGISTRY_ADDRESS ||
          '0xc15d5a57a8eb0e1dcbe5d88b8f9a82017e5cc4af',
        ensRegistryAddress:
          process.env.ENS_REGISTRY_ADDRESS ||
          '0xd7CeF70Ba7efc2035256d828d5287e2D285CD1ac',
      },
      issuerResolver,
      revokerResolver,
      credentialResolver,
      verifyCredential
    )
  );
  passport.use(
    new Strategy(jwtOptions, function (payload, done) {
      return done(null, payload);
    })
  );
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });
  return { passport, LOGIN_STRATEGY };
};
