import { Injectable } from '@angular/core';
import { setCacheClientOptions, setChainConfig, IAM } from 'iam-client-lib';

@Injectable({
  providedIn: 'root'
})
export class IamService {
  readonly iam: IAM;

  constructor() {
    const VOLTA_CHAIN_ID = 73799;
    setCacheClientOptions(VOLTA_CHAIN_ID, {
      url: "https://volta-identitycache.energyweb.org/",
    });
    setChainConfig(VOLTA_CHAIN_ID, {
      rpcUrl: "https://volta-rpc.energyweb.org",
    });
    this.iam = new IAM();
  }
}
