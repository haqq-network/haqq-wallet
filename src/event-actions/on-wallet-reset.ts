import {StackActions} from '@react-navigation/native';

import {app} from '@app/contexts';
import {navigator} from '@app/navigator';

export async function onWalletReset() {
  navigator.dispatch(StackActions.replace('welcome'));
  app.getUser().onboarded = false;
}
