import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    this.matIconRegistry.addSvgIcon(
      'home-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/img/icons/home-icon.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'statistics-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/img/icons/statistics-icon.svg'
      )
    );

    this.matIconRegistry.addSvgIcon(
      'warning-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/img/icons/warning-icon.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'account-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/img/icons/account-icon.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'logout-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/img/icons/logout-icon.svg'
      )
    );
  }
}
