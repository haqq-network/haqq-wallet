import React from 'react';

import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color, getColor} from '@app/colors';
import {Icon, IconButton, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';

export type QrTopViewProps = {
  onClose: () => void;
};

export const QrTopView = ({onClose}: QrTopViewProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{paddingTop: insets.top}}>
      <View style={styles.headerContainer}>
        <IconButton onPress={onClose}>
          <Icon s name="arrow_back" color={getColor(Color.graphicBase3)} />
        </IconButton>
        <Text t8 style={styles.headerTitle}>
          Scan QR Code
        </Text>
        <View style={styles.headerSpacer} />
      </View>
    </View>
  );
};

const styles = createTheme({
  headerContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    height: 56,
    flexDirection: 'row',
  },
  headerTitle: {
    fontWeight: '600',
    textAlign: 'center',
    color: Color.textBase3,
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
});
