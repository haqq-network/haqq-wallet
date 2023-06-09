import {StackActions} from '@react-navigation/native';

import {navigator} from '@app/navigator';

export async function onWalletReset() {
  navigator.dispatch(StackActions.replace('welcome'));
}
