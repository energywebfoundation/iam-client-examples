import { Component } from '@angular/core';
import axios from 'axios';
import { IamService } from '../iam.service';
import { environment } from '../../environments/environment';

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

  isLoading = false;
  errored = false;
  did: string = undefined;
  enrolmentURL = environment.ENROLMENT_URL;
  roles: Role[] = [];

  async verifyIdentity() {
    const claim = await this.iamService.iam.createIdentityProof();
    const {
      data: { token },
    } = await axios.post<{ token: string }>(
      `${environment.BACKEND_URL}/login`,
      {
        claim,
      }
    );
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const { data: roles } = await axios.get<Role[]>(
      `${environment.BACKEND_URL}/roles`,
      config
    );
    this.roles = roles;
  }

  async login({ useMetamaskExtension }: { useMetamaskExtension: boolean }) {
    this.isLoading = true;
    this.errored = false;
    try {
      const { did } = await this.iamService.iam.initializeConnection({
        useMetamaskExtension,
      });
      if (did) {
        this.did = did;
        await this.verifyIdentity();
      }
    } catch (err) {
      this.did = undefined;
      this.errored = true;
    }
    this.isLoading = false;
  }

  logout() {
    this.did = '';
  }
}
