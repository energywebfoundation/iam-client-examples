import { config } from 'dotenv';

config()

export const backendUrl = "http://localhost:3333";
export const userPrivateKey = process.env.PRIVATE_KEY || "";