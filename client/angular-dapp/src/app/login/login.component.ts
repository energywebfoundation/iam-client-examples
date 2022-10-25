import { Component, OnInit } from '@angular/core';
import { IamService } from '../iam.service';
import { environment } from '../../environments/environment';
import { ProviderType, SignerService } from 'iam-client-lib';
import { LoginService } from '../services/login/login.service';
import { RolesService } from '../services/roles/roles.service';
import { Role } from '../models/role';
import { filter, finalize, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  providers = ProviderType;
  isLoading = false;
  errored = false;
  unauthorized = false;
  signerService: SignerService = null;
  did$: Observable<string> = this.loginService.did$;
  isAuthorized$: Observable<boolean> = this.loginService.isAuthorized$;
  enrolmentURL = environment.ENROLMENT_URL
    ? `${environment.ENROLMENT_URL}&returnUrl=${encodeURIComponent(
      window.location.href
    )}`
    : '';
  roles: Role[] = [];

  constructor(private readonly iamService: IamService, private loginService: LoginService, private rolesService: RolesService) {
  }

  ngOnInit(): void {
    this.loginService.checkStatus();
  }

  login({providerType}: { providerType: ProviderType }): void {
    this.isLoading = true;
    this.errored = false;
    this.unauthorized = false;

    this.isAuthorized$.pipe(
      filter(Boolean),
      tap(() => this.isLoading = true),
      switchMap(() => this.rolesService.get().pipe(finalize(() => this.isLoading = false)))
    ).subscribe(roles => this.roles = roles);

    this.loginService.login(providerType).pipe(
      filter(({did}) => Boolean(did)),
      finalize(() => this.isLoading = false)
    ).subscribe(({roles}) => {
      this.roles = roles;
    }, error => {
      this.clearRoleList();
      if (error?.status === 401) {
        this.unauthorized = true;
      } else {
        this.errored = true;
      }
    });
  }

  async logout(): Promise<void> {
    this.clearRoleList();
    await this.loginService.logout();
  }

  private clearRoleList(): void {
    this.roles = [];
  }
}
