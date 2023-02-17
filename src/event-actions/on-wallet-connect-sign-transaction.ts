import {navigator} from '@app/navigator';
import {WalletConnectSessionRequestEvent} from '@app/types/wallet-connect';

export function onWalletConnectSignTransaction(
  params: WalletConnectSessionRequestEvent,
) {
  navigator.navigate('walletConnect', {
    screen: 'walletConnectSign',
    params: {event: params},
  });
}
