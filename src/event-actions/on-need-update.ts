import {Alert} from 'react-native';

import {I18N, getText} from '@app/i18n';
import {openStorePage} from '@app/utils';

export async function onNeedUpdate() {
  Alert.alert(
    getText(I18N.newUpdateTitle),
    getText(I18N.newUpdateDescription),
    [
      {text: getText(I18N.newUpdateCancel)},
      {
        text: getText(I18N.newUpdateAccept),
        onPress: openStorePage,
        isPreferred: true,
      },
    ],
  );
}
