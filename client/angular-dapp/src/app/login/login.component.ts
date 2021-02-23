import { Component } from '@angular/core';
import axios from 'axios';
import { IamService } from '../iam.service';
import { environment } from '../../environments/environment';
import { WalletProvider } from 'iam-client-lib';

type Role = {
  name: string;
  namespace: string;
};

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(private readonly iamService: IamService) {}

  providers = WalletProvider;
  isLoading = false;
  errored = false;
  unauthorized = false;
  did: string = undefined;
  enrolmentURL = environment.ENROLMENT_URL
    ? `${environment.ENROLMENT_URL}&returnUrl=${encodeURIComponent(
        window.location.href
      )}`
    : '';
  roles: Role[] = [];

  async login({ walletProvider }: { walletProvider: WalletProvider }) {
    this.isLoading = true;
    this.errored = false;
    this.unauthorized = false;
    try {
      const {
        identityToken,
        did,
      } = await this.iamService.iam.initializeConnection({
        walletProvider,
      });

      if (did) {
        this.did = did;
      }

      if (identityToken) {
        await axios.post(
          `${environment.BACKEND_URL}/login`,
          {
            identityToken,
          },
          { withCredentials: true }
        );
      }

      const { data: roles } = await axios.get<Role[]>(
        `${environment.BACKEND_URL}/roles`,
        { withCredentials: true }
      );
      this.roles = roles;
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
    this.did = '';
    await this.iamService.iam.closeConnection();
  }
}
