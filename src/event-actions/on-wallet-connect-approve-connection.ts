import {navigator} from '@app/navigator';

export function onWalletConnectApproveConnection(proposal: {id: string}) {
  navigator.navigate('walletConnect', proposal);
}
