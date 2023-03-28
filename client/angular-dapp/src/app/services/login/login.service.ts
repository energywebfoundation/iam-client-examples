import { Injectable } from '@angular/core';
import { initWithMetamask, initWithWalletConnect, ProviderType } from 'iam-client-lib';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { SignerService } from 'iam-client-lib/dist/src/modules/signer';
import { Role } from '../../models/role';
import { SiweMessage } from 'siwe';

type LoginToken = string & { authorizationStatus: boolean; did: string; userRoles: Role[] };

@Injectable({providedIn: 'root'})
export class LoginService {
  private did = new BehaviorSubject('');
  private provider = new BehaviorSubject<ProviderType>( null);
  private signerService: SignerService;
  private isAuthorized = new BehaviorSubject(false);
  private readonly url = environment.BACKEND_URL;

  constructor(private httpClient: HttpClient) {
  }

  get wallet$(): Observable<ProviderType> {
    return this.provider.asObservable();
  }

  get did$(): Observable<string> {
    return this.did.asObservable();
  }

  get isAuthorized$(): Observable<boolean> {
    return this.isAuthorized.asObservable();
  }

  login(providerType: ProviderType): Observable<{ did: string, roles: Role[] }> {
    return from(this.initSignerService(providerType))
      .pipe(
        tap(({signerService}) => this.signerService = signerService),
        switchMap(({signerService}) => this.connectToBackend().pipe(
          tap(() => {
            this.setDID();
            this.setProvider(providerType);
          }),
          map((response: { token: LoginToken }) => {
            if (typeof response?.token === 'string') {
              this.isAuthorized.next(true);
            }
            return ({did: this.did.getValue(), roles: response.token?.userRoles || []});
          })))
      );
  }

  checkStatus(): void {
    this.httpClient.get(`${environment.BACKEND_URL}/login-status`, {withCredentials: true})
      .pipe(catchError((error) => {
        if (error?.status === 401) {
          this.logout();
        }
        return of(error);
      }))
      .subscribe(({loginStatus}) => {
        if (!loginStatus) {
          this.logout();
        }
      });
  }

  async logout(): Promise<void> {
    // tslint:disable-next-line:no-unused-expression
    this.signerService && (await this.signerService.closeConnection());
    this.did.next('');
    this.isAuthorized.next(false);
    localStorage.clear();
  }

  private async initSignerService(providerType: ProviderType): Promise<unknown> {
    switch (providerType) {
      case ProviderType.MetaMask:
        return initWithMetamask();
      case ProviderType.WalletConnect:
        return initWithWalletConnect();
      default:
        throw new Error(`no handler for provider '${providerType}'`);
    }
  }

  private setDID(): void {
    this.did.next(this.signerService.did);
  }

  private setProvider(provider: ProviderType): void {
    this.provider.next(provider);
  }

  private async connectToBackend(): Observable<unknown> {
    const {
      data: { nonce },
    } = this.httpClient.post<{ nonce: string; }>('/login/siwe/initiate');
    const uri = new URL('/v1/login/siwe/verify', new URL(this.url).origin)
      .href;
    const message = new SiweMessage({
      nonce,
      domain: new URL(this.url).host,
      address: this.signerService.address,
      uri,
      version: '1',
      chainId: this.signerService.chainId,
    }).prepareMessage();

    const signature = await this.signerService.signer.signMessage(message);

    return from(signature).pipe(switchMap(((signature) => this.httpClient.post(
        `${this.url}/v1/login/siwe/verify`,
        {
          signature
        },
        {withCredentials: true}
      )))
    );
  }
}
