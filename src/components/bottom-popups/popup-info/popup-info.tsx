import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {Text, TextPosition, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {ModalType, Modals} from '@app/types';

export const InfoPopup = ({
  title,
  description,
  onClose,
}: Modals[ModalType.info]) => {
  return (
    <View style={styles.sub}>
      <View style={styles.row}>
        <Text
          variant={TextVariant.t7}
          position={TextPosition.left}
          style={styles.title}>
          {title}
        </Text>
        <DismissPopupButton onClose={onClose} />
      </View>
      <Text
        variant={TextVariant.t14}
        position={TextPosition.left}
        color={Color.textBase2}
        style={styles.t14}>
        {description}
      </Text>
    </View>
  );
};

const styles = createTheme({
  sub: {
    marginHorizontal: 16,
    marginVertical: 35,
    backgroundColor: Color.bg1,
    flex: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    marginBottom: 8,
  },
  t14: {
    marginBottom: 28,
  },
});
