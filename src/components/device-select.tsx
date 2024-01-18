import React, {memo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {ImageDescriptionBlock} from './image-description-block';
import {Spacer, Text} from './ui';

interface DeviceSelectProps {
  onPressLedger(): void;
  onPressKeystone(): void;
}

export const DeviceSelect = memo(
  ({onPressKeystone, onPressLedger}: DeviceSelectProps) => {
    return (
      <View style={styles.container}>
        <Text center t4 i18n={I18N.deviceSelectTitle} />
        <Text
          center
          t11
          i18n={I18N.deviceSelectDescription}
          color={Color.textBase2}
        />
        <Spacer height={40} />
        <ImageDescriptionBlock
          title={I18N.deviceSelectKeystoneTitle}
          description={I18N.deviceSelectKeystoneDescription}
          onPress={onPressKeystone}
          source={require('@assets/images/device-keystone.png')}
        />
        <Spacer height={24} />
        <ImageDescriptionBlock
          title={I18N.deviceSelectLedgerTitle}
          description={I18N.deviceSelectLedgerDescription}
          onPress={onPressLedger}
          source={require('@assets/images/device-ledger.png')}
        />
      </View>
    );
  },
);

const styles = createTheme({
  container: {
    marginHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
});
