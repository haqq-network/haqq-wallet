import {navigator} from '@app/navigator';

export async function onWalletReset() {
  navigator.dispatch({type: 'reset-pin'});
}
