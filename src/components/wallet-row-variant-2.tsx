import React, {useCallback, useMemo} from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {CardSmall, MenuNavigationButton, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {splitAddress} from '@app/utils';
import {STRINGS} from '@app/variables/common';

import {WalletRowProps} from './wallet-row';

const CARD_WIDTH = 54.89;
const CARD_RADIUS = 8;

export const WalletRowVariant2 = ({
  item,
  onPress,
  hideArrow = false,
  checked = false,
  style,
}: Omit<WalletRowProps, 'type'>) => {
  const containerStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.container,
        item.isHidden && {opacity: 0.5},
        style,
      ]),
    [item.isHidden, style],
  );

  const pressCard = useCallback(
    () => onPress?.(item.address),
    [item.address, onPress],
  );

  const addressString = useMemo(
    () => `•••${splitAddress(item.address)[2]}`,
    [item.address],
  );

  return (
    <MenuNavigationButton
      checked={checked}
      hideArrow={hideArrow}
      onPress={pressCard}
      style={containerStyle}>
      <CardSmall
        width={CARD_WIDTH}
        borderRadius={CARD_RADIUS}
        pattern={item.pattern}
        colorFrom={item.colorFrom}
        colorTo={item.colorTo}
        colorPattern={item.colorPattern}
      />
      <View style={styles.textContainer}>
        <Text t14 color={Color.textBase2} i18n={I18N.walletRowVariant2Title} />
        <Text t11 color={Color.textBase1}>
          {item.name}
          {STRINGS.NBSP}
          {addressString}
        </Text>
      </View>
    </MenuNavigationButton>
  );
};

const styles = createTheme({
  container: {
    backgroundColor: Color.bg8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  textContainer: {
    marginLeft: 12,
  },
});
