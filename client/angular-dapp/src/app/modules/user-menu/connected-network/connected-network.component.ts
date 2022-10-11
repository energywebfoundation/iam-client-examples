import { ChangeDetectionStrategy, Component, Input, OnInit, } from '@angular/core';
import { ProviderType } from 'iam-client-lib';

const ICON_MAP = new Map()
  .set(ProviderType.WalletConnect, 'assets/icons/wallet-connect-icon.svg')
  .set(ProviderType.MetaMask, 'assets/icons/metamask-logo.svg');

@Component({
  selector: 'app-connected-network',
  templateUrl: './connected-network.component.html',
  styleUrls: ['./connected-network.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectedNetworkComponent implements OnInit {
  @Input() chainName: string;
  @Input() wallet: ProviderType | string;
  walletIcon: string;

  ngOnInit(): void {
    this.setIcon();
  }

  setIcon(): void {
    ICON_MAP.has(this.wallet)
      ? (this.walletIcon = ICON_MAP.get(this.wallet))
      : console.error('Not supported provider for icons.');
  }
}
