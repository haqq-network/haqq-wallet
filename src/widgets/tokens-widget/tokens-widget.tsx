import React, {useMemo} from 'react';

import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {TokenRow} from '@app/components/token-row';
import {Spacer, Text} from '@app/components/ui';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {I18N, getText} from '@app/i18n';
import {IToken} from '@app/types';

type Props = {
  onPress: () => void;
  tokens: IToken[];
};

const VISIBLE_ITEM_AMOUNT = 3;

export const TokensWidget = ({onPress, tokens}: Props) => {
  const otherTokensAmount = useMemo(() => {
    const leftover = tokens.length - VISIBLE_ITEM_AMOUNT;
    if (leftover < 1) {
      return null;
    }
    if (leftover === 1) {
      return getText(I18N.plusOtherToken, {value: String(leftover)});
    }
    return getText(I18N.plusOtherTokens, {value: String(leftover)});
  }, [tokens.length]);

  if (tokens.length === 0) {
    return null;
  }
  return (
    <ShadowCard onPress={onPress} style={styles.wrapper}>
      <WidgetHeader title={getText(I18N.tokensWidgetTitle)} />
      <Spacer height={8} />
      {tokens
        .filter(item => !!item.is_in_white_list)
        .slice(0, VISIBLE_ITEM_AMOUNT)
        .map(item => {
          return <TokenRow key={item.id} item={item} />;
        })}
      {otherTokensAmount !== null && (
        <>
          <Spacer height={4} />
          <Text t14 color={Color.textBase2}>
            {otherTokensAmount}
          </Text>
        </>
      )}
    </ShadowCard>
  );
};

const styles = StyleSheet.create({
  wrapper: {paddingHorizontal: 16},
});
