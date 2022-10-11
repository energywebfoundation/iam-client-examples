import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoginService } from '../services/login/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  did$ = this.loginService.did$;
  wallet$ = this.loginService.wallet$;

  constructor(private loginService: LoginService) {
  }

  logout(): Promise<void> {
    return this.loginService.logout();
  }
}
