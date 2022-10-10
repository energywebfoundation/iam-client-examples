import { Component } from '@angular/core';
import axios from 'axios';
import { IamService } from '../iam.service';
import { environment } from '../../environments/environment';
import {
  initWithMetamask,
  initWithWalletConnect,
  ProviderType,
  SignerService
} from 'iam-client-lib';

type Role = {
  name: string;
  namespace: string;
};

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private readonly iamService: IamService) {}
  providers = ProviderType;
  isLoading = false;
  errored = false;
  unauthorized = false;
  signerService: SignerService = null;
  did: string = localStorage.getItem('did');
  enrolmentURL = environment.ENROLMENT_URL
    ? `${environment.ENROLMENT_URL}&returnUrl=${encodeURIComponent(
        window.location.href
      )}`
    : '';
  roles: Role[] = JSON.parse(localStorage.getItem('roles')) || [];

  ngOnInit() {
    const loginStatus = async () => {
      try {
        const res = await axios.get(`${environment.BACKEND_URL}/login-status`, {
          withCredentials: true
        });
        const { loginStatus } = res.data;
        if (!loginStatus) {
          this.logout();
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          this.logout();
        }
      }
    };
    loginStatus();
  }

  initSignerService = async function(providerType: ProviderType) {
    switch (providerType) {
      case ProviderType.MetaMask:
        return initWithMetamask();
      case ProviderType.WalletConnect:
        return initWithWalletConnect();
      default:
        throw new Error(`no handler for provider '${providerType}'`);
    }
  };

  async login({ providerType }: { providerType: ProviderType }) {
    this.isLoading = true;
    this.errored = false;
    this.unauthorized = false;
    try {
      this.signerService = (await this.initSignerService(providerType))
        .signerService;
      this.did = this.signerService.did;
      localStorage.setItem('did', this.signerService.did);
      let {
        identityToken
      } = await this.signerService.publicKeyAndIdentityToken();
      if (identityToken) {
        await axios.post(
          `${environment.BACKEND_URL}/login`,
          {
            identityToken
          },
          { withCredentials: true }
        );
      }

      const { data: roles } = await axios.get<Role[]>(
        `${environment.BACKEND_URL}/roles`,
        { withCredentials: true }
      );
      this.roles = roles;
      localStorage.setItem('roles', JSON.stringify(roles));
    } catch (err) {
      console.log(err);
      this.did = undefined;
      if (err?.response?.status === 401) {
        this.unauthorized = true;
      } else {
        this.errored = true;
      }
    }
    this.isLoading = false;
  }

  async logout() {
    this.signerService && (await this.signerService.closeConnection());
    this.did = '';
    localStorage.clear();
  }
}
