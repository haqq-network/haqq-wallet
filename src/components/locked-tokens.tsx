import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {BalanceModel, Wallet} from '@app/models/wallet';

import {
  Badge,
  First,
  Icon,
  IconButton,
  IconsName,
  Spacer,
  Text,
  TextVariant,
} from './ui';
import {Placeholder} from './ui/placeholder';

export interface LockedTokensProps {
  balance?: BalanceModel;
  onForwardPress(): void;
}

export const LockedTokens = observer(
  ({balance, onForwardPress}: LockedTokensProps) => {
    const {available, locked, total} = balance ?? {};
    const defaultTotalValueISLM = useMemo(
      () => `0 ${Provider.selectedProvider.denom}`,
      [Provider.selectedProvider.denom],
    );
    const defaultTotalValueUSD = useMemo(() => '$0', []);
    const isBalancesLoading = Wallet.checkWalletBalanceLoading(
      Wallet.getAll()[0],
    );

    return (
      <View style={styles.container}>
        <Text
          variant={TextVariant.t12}
          color={Color.textBase2}
          i18n={I18N.lockedTokensTotalValue}
        />
        <First>
          {isBalancesLoading && (
            <Placeholder opacity={0.9}>
              <Placeholder.Item height={20} width={100} />
            </Placeholder>
          )}
          <View style={styles.row}>
            <Text variant={TextVariant.t7}>
              {total?.toBalanceString('auto') ?? defaultTotalValueISLM}
            </Text>
            <Spacer width={4} />
            {!!total?.toFiat() && (
              <Badge
                text={total?.toFiat() ?? defaultTotalValueUSD}
                labelColor={Color.graphicSecond1}
                textColor={Color.textBase1}
                textVariant={TextVariant.t19}
              />
            )}
            <Spacer width={4} />
            <IconButton onPress={onForwardPress} style={styles.iconButton}>
              <Icon
                i12
                color={Color.graphicSecond4}
                name={IconsName.arrow_forward}
              />
            </IconButton>
          </View>
        </First>
        <Spacer height={4} />
        <First>
          {isBalancesLoading && (
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
              variant={TextVariant.t14}
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
                  variant={TextVariant.t14}
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
  },
);

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.graphicSecond1,
    borderRadius: 8,
    paddingRight: 5,
  },
});
