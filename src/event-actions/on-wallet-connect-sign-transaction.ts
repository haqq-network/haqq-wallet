import {navigator} from '@app/navigator';
import {WalletConnectSessionRequestType} from '@app/types/wallet-connect';

export function onWalletConnectSignTransaction(
  params: WalletConnectSessionRequestType,
) {
  navigator.navigate('walletConnect', {
    screen: 'walletConnectSign',
    params: {event: params},
  });
}
