import React from 'react';

import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {Icon, IconButton, Text} from '@app/components/ui';
import {I18N} from '@app/i18n';

export type QrTopViewProps = {
  onClose: () => void;
};

export const QrTopView = ({onClose}: QrTopViewProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{paddingTop: insets.top}}>
      <View style={styles.headerContainer}>
        <IconButton onPress={onClose}>
          <Icon i24 name="arrow_back" color={Color.graphicBase3} />
        </IconButton>
        <Text t8 center i18n={I18N.modalQRTitle} color={Color.textBase3} />
        <View style={styles.headerSpacer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    height: 56,
    flexDirection: 'row',
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
});
