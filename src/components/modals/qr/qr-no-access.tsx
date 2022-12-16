import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {QrTopView} from '@app/components/modals/qr/qr-top-view';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type QrNoAccessProps = {
  onClose: () => void;
};

export const QrNoAccess = ({onClose}: QrNoAccessProps) => {
  return (
    <View style={styles.background}>
      <QrTopView onClose={onClose} />
      <View style={styles.backgroundInfo}>
        <Text
          t4
          center
          color={Color.textBase3}
          i18n={I18N.modalQRNoAccessTitle}
        />
        <Text
          t11
          center
          i18n={I18N.modalQRNoAccessDescription}
          color={Color.textBase2}
          style={styles.backgroundDescription}
        />
      </View>
    </View>
  );
};

const styles = createTheme({
  background: {
    flex: 1,
    backgroundColor: Color.bg10,
    justifyContent: 'center',
    padding: 20,
  },
  backgroundInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundDescription: {
    marginTop: 4,
  },
});
