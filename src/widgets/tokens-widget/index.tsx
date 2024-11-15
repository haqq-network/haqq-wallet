import React, {useCallback, useEffect, useMemo} from 'react';

import {toJS} from 'mobx';
import {observer} from 'mobx-react';

import {TotalValueTabNames} from '@app/components/total-value-info';
import {useTypedNavigation} from '@app/hooks';
import {Token} from '@app/models/tokens';
import {HomeStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {IToken} from '@app/types';
import {TokensWidget} from '@app/widgets/tokens-widget/tokens-widget';

const VISIBLE_ITEM_AMOUNT = 3;

export const TokensWidgetWrapper = observer(() => {
  const tokens = Token.getAllPositive();
  const navigation = useTypedNavigation();
  const openTotalValue = useCallback(() => {
    navigation.navigate(HomeStackRoutes.TotalValueInfo, {
      tab: TotalValueTabNames.tokens,
    });
  }, [navigation]);

  useEffect(() => {
    Token.fetchTokens();
  }, []);

  const accumulatedTokens = useMemo(() => {
    const cache: Record<string, IToken> = {};

    tokens
      .filter(item => !!item.is_in_white_list && item.is_erc20)
      .slice(0, VISIBLE_ITEM_AMOUNT)
      .forEach(token => {
        if (token.symbol && cache[token.symbol]) {
          const item = cache[token.symbol];
          cache[token.symbol].value = new Balance(item.value).operate(
            token.value,
            'add',
          );
        } else {
          if (token.symbol) {
            cache[token.symbol] = toJS(token);
          }
        }
      });

    return Object.values(cache);
  }, [tokens]);

  if (tokens.length === 0) {
    return null;
  }
  return (
    <TokensWidget
      onPress={openTotalValue}
      tokens={accumulatedTokens}
      visibleItemAmount={VISIBLE_ITEM_AMOUNT}
    />
  );
});
