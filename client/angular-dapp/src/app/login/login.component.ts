import { Component, OnInit } from '@angular/core';
import { IamService } from '../iam.service';
import { environment } from '../../environments/environment';
import { ProviderType, SignerService } from 'iam-client-lib';
import { LoginService } from '../services/login/login.service';
import { RolesService } from '../services/roles/roles.service';
import { Role } from '../models/role';
import { filter, finalize, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  providers = ProviderType;
  isLoading = false;
  errored = false;
  unauthorized = false;
  signerService: SignerService = null;
  did$: Observable<string> = this.loginService.did$;
  enrolmentURL = environment.ENROLMENT_URL
    ? `${environment.ENROLMENT_URL}&returnUrl=${encodeURIComponent(
      window.location.href
    )}`
    : '';
  roles: Role[] = JSON.parse(localStorage.getItem('roles')) || [];

  constructor(private readonly iamService: IamService, private loginService: LoginService, private rolesService: RolesService) {
  }

  ngOnInit(): void {
    this.loginService.checkStatus();
  }

  login({providerType}: { providerType: ProviderType }): void {
    this.isLoading = true;
    this.errored = false;
    this.unauthorized = false;

    this.loginService.login(providerType).pipe(
      filter(({did}) => Boolean(did)),
      switchMap(() => this.rolesService.get().pipe(finalize(() => this.isLoading = false))),
    ).subscribe(roles => this.roles = roles, error => {
      console.log(error);
      if (error?.status === 401) {
        this.unauthorized = true;
      } else {
        this.errored = true;
      }
      this.isLoading = false;
    });
  }

  async logout(): Promise<void> {
    await this.loginService.logout();
  }
}
