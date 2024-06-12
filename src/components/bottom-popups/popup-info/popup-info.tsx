import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Text, TextPosition, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {ModalType, Modals} from '@app/types';

export const InfoPopup = ({title, description}: Modals[ModalType.info]) => {
  return (
    <View style={styles.sub}>
      <Text
        variant={TextVariant.t7}
        position={TextPosition.left}
        style={styles.title}>
        {title}
      </Text>
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
    paddingVertical: 32,
    borderRadius: 16,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  t14: {
    marginBottom: 28,
  },
});
