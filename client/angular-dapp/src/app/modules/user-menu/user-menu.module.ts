import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectedNetworkComponent } from './connected-network/connected-network.component';
import { UserDidComponent } from './user-did/user-did.component';
import { UserNameComponent } from './user-name/user-name.component';
import { MatIconModule } from '@angular/material/icon';
import { UserMenuTriggerComponent } from './user-menu-trigger/user-menu-trigger.component';
import { DidFormatMinifierModule } from '../pipes/did-format-minifier/did-format-minifier.module';
import { CopyToClipboardModule } from '../directives/copy-to-clipboard/copy-to-clipboard.module';
import { DividerComponent } from '../../components/divider/divider.component';

@NgModule({
  declarations: [
    ConnectedNetworkComponent,
    UserDidComponent,
    UserNameComponent,
    UserMenuTriggerComponent,
    DividerComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    CopyToClipboardModule,
    DidFormatMinifierModule,
  ],
  exports: [
    ConnectedNetworkComponent,
    UserDidComponent,
    UserNameComponent,
    UserMenuTriggerComponent,
    DividerComponent,
  ],
})
export class UserMenuModule {}
