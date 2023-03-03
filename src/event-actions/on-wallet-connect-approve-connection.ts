import {navigator} from '@app/navigator';
import {WalletConnectApproveConnectionEvent} from '@app/types/wallet-connect';

export function onWalletConnectApproveConnection(
  event: WalletConnectApproveConnectionEvent,
) {
  navigator.navigate('walletConnect', {
    screen: 'walletConnectApproval',
    params: {
      event,
    },
  });
}
