import React, {useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useIsBalancesFirstSync} from '@app/hooks/use-is-balances-sync';
import {I18N} from '@app/i18n';
import {BalanceData} from '@app/types';
import {CURRENCY_NAME} from '@app/variables/common';

import {Badge, First, Icon, IconButton, IconsName, Spacer, Text} from './ui';
import {Placeholder} from './ui/placeholder';

export interface LockedTokensProps {
  balance?: BalanceData;

  onForwardPress(): void;
}

export function LockedTokens({balance, onForwardPress}: LockedTokensProps) {
  const {available, locked, total} = balance ?? {};
  const {isBalaceLoadingError, isBalancesFirstSync} = useIsBalancesFirstSync();
  const defaultTotalValueISLM = useMemo(() => `0 ${CURRENCY_NAME}`, []);
  const defaultTotalValueUSD = useMemo(() => '$0', []);

  const showPlaceholder = useMemo(() => {
    if (isBalancesFirstSync) {
      return true;
    }

    if (isBalaceLoadingError) {
      return !total?.isPositive();
    }

    return false;
  }, [isBalaceLoadingError, isBalancesFirstSync]);

  return (
    <View style={styles.container}>
      <Text t12 color={Color.textBase2} i18n={I18N.lockedTokensTotalValue} />
      <First>
        {showPlaceholder && (
          <Placeholder opacity={0.9}>
            <Placeholder.Item height={24} width={100} />
          </Placeholder>
        )}
        <View style={styles.row}>
          <Text t7>{total?.toBalanceString(0) ?? defaultTotalValueISLM}</Text>
          <Spacer width={4} />
          <Badge
            text={total?.toFiat() ?? defaultTotalValueUSD}
            labelColor={Color.graphicSecond1}
            textColor={Color.textBase1}
          />
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
      </First>
      <Spacer height={4} />
      <First>
        {isBalancesFirstSync && (
          <>
            <Spacer height={4} />
            <Placeholder opacity={0.9}>
              <Placeholder.Item height={14} width={200} />
            </Placeholder>
          </>
        )}
        <View style={styles.row}>
          <Icon i18 color={Color.graphicBase2} name={IconsName.coin} />
          <Spacer width={4} />
          <Text
            t14
            color={Color.textBase2}
            i18n={I18N.lockedTokensAvailable}
            i18params={{count: available?.toFloatString() ?? '0'}}
          />
          {locked?.isPositive() && (
            <>
              <Spacer width={8} />
              <Icon i18 color={Color.graphicBase2} name={IconsName.lock} />
              <Spacer width={4} />
              <Text
                t14
                color={Color.textBase2}
                i18n={I18N.lockedTokensLocked}
                i18params={{count: locked?.toFloatString() ?? '0'}}
              />
            </>
          )}
        </View>
      </First>
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
