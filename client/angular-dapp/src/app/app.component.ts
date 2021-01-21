import { Component } from '@angular/core';
import axios from 'axios'
import { IamService } from './iam.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private readonly iamService: IamService
  ) { }

  isLoading: boolean = false
  did = undefined
  roles: Role[]

  async verifyIdentity() {
    const claim = await this.iamService.iam.createIdentityProof();
    const {
      data: { token }
    } = await axios.post<{ token: string }>("https://did-auth-demo.energyweb.org/login", {
      claim
    });
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const { data: roles } = await axios.get<Role[]>(
      "https://did-auth-demo.energyweb.org/roles",
      config
    );
    this.roles = roles;
  }

  async login({ useMetamaskExtension }: { useMetamaskExtension: boolean }) {
    this.isLoading = true;
    const { did } = await this.iamService.iam.initializeConnection({ useMetamaskExtension });
    if (did) {
      this.did = did;
      try {
        await this.verifyIdentity();
      } catch (err) {
        this.isLoading = false;
      }
    }
    this.isLoading = false;
  }

  logout() {
    this.did = "";
  }
}

type Role = {
  name: string;
  namespace: string;
};