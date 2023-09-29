import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {BalanceData} from '@app/types';

import {Icon, IconButton, IconsName, Spacer, Text} from './ui';

export interface LockedTokensProps {
  balance?: BalanceData;
  onForwardPress(): void;
}

export function LockedTokens({balance, onForwardPress}: LockedTokensProps) {
  const {available, locked, total} = balance ?? {};
  return (
    <View style={styles.container}>
      <Text t12 color={Color.textBase2} i18n={I18N.lockedTokensTotalValue} />
      <View style={styles.row}>
        <Text t7>{total?.toBalanceString() ?? '0'}</Text>
        <Spacer width={4} />
        <IconButton onPress={onForwardPress} style={styles.iconButton}>
          <Icon
            i12
            color={Color.graphicSecond4}
            name={IconsName.arrow_forward}
            style={styles.icon}
          />
        </IconButton>
      </View>
      <Spacer height={4} />
      <View style={styles.row}>
        <Icon i18 color={Color.graphicBase2} name={IconsName.coin} />
        <Spacer width={4} />
        <Text
          t14
          color={Color.textBase2}
          i18n={I18N.lockedTokensAvailable}
          i18params={{count: available?.toFloatString() ?? '0'}}
        />
        <Spacer width={8} />
        <Icon i18 color={Color.graphicBase2} name={IconsName.lock} />
        <Spacer width={4} />
        <Text
          t14
          color={Color.textBase2}
          i18n={I18N.lockedTokensLocked}
          i18params={{count: locked?.toFloatString() ?? '0'}}
        />
      </View>
    </View>
  );
}

const styles = createTheme({
  container: {
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.graphicSecond1,
    borderRadius: 8,
  },
  icon: {
    transform: [{translateX: -2.5}],
  },
});
