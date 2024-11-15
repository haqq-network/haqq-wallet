import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {TokenRow} from '@app/components/token';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {I18N, getText} from '@app/i18n';
import {IToken} from '@app/types';

type Props = {
  onPress: () => void;
  tokens: IToken[];
  visibleItemAmount: number;
};

export const TokensWidget = observer(
  ({onPress, tokens, visibleItemAmount}: Props) => {
    const otherTokensAmount = useMemo(() => {
      const leftover = tokens.length - visibleItemAmount;
      if (leftover < 1) {
        return null;
      }
      if (leftover === 1) {
        return getText(I18N.plusOtherToken, {value: String(leftover)});
      }
      return getText(I18N.plusOtherTokens, {value: String(leftover)});
    }, [tokens.length]);

    return (
      <ShadowCard onPress={onPress} style={styles.wrapper}>
        <WidgetHeader title={getText(I18N.tokensWidgetTitle)} />
        <Spacer height={8} />
        {tokens.map(item => {
          return (
            <TokenRow
              key={'tokens_widget_token_row_' + item.id + item.symbol}
              item={item}
            />
          );
        })}
        {otherTokensAmount !== null && (
          <>
            <Spacer height={4} />
            <Text variant={TextVariant.t14} color={Color.textBase2}>
              {otherTokensAmount}
            </Text>
          </>
        )}
      </ShadowCard>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {paddingHorizontal: 16},
});
