import { config } from 'dotenv';

config();
export const chainId = 73799;
export const backendUrl = 'http://localhost:3333';
export const rpcUrl = 'https://volta-rpc.energyweb.org';
export const cacheServerUrl = "https://identitycache-dev.energyweb.org/v1";
export const ownerPrivateKey = process.env.PRIVATE_KEY || ''
