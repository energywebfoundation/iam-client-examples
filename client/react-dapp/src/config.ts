const VOLTA_CHAIN_ID = 73799;

export const config: {
  backendUrl: string;
  enrolmentUrl?: string;
  cacheServerUrl: string;
  chainRpcUrl: string;
  chainId: number;
} = {
  backendUrl: "http://localhost:3333",
  enrolmentUrl: "",
  cacheServerUrl: "https://volta-identitycache.energyweb.org/v1",
  chainRpcUrl: "https://volta-rpc.energyweb.org/",
  chainId: VOLTA_CHAIN_ID,
};
