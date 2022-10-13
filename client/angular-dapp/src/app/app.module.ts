import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { SourceCodeComponent } from './source-code/source-code.component';
import { HeaderComponent } from './header/header.component';
import { UserMenuModule } from './modules/user-menu/user-menu.module';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { RoleListComponent } from './components/role-list/role-list.component';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SpinnerComponent,
    SourceCodeComponent,
    HeaderComponent,
    RoleListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    UserMenuModule,
    MatMenuModule,
    MatButtonModule,
    HttpClientModule,
    MatTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
