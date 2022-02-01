import { Injectable } from '@angular/core';
import { setCacheConfig, setChainConfig } from 'iam-client-lib';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IamService {
  constructor() {
    setCacheConfig(environment.VOLTA_CHAIN_ID, {
      url: environment.CACHE_SERVER_URL
    });
    setChainConfig(environment.VOLTA_CHAIN_ID, {
      rpcUrl: environment.VOLTA_RPC_URL
    });
  }
}
