import {Alert} from 'react-native';

import {openStorePage} from '@app/utils';

export async function onNeedUpdate() {
  // TODO: wait for desiger
  Alert.alert('New update avalivable', 'update now?', [
    {text: 'Later'},
    {text: 'Update', onPress: openStorePage},
  ]);
}
