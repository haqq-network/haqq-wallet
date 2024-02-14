import React, {useCallback, useEffect, useMemo} from 'react';

import {observer} from 'mobx-react';

import {TotalValueTabNames} from '@app/components/total-value-info';
import {useTypedNavigation} from '@app/hooks';
import {Token} from '@app/models/tokens';
import {HomeStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {IToken} from '@app/types';
import {TokensWidget} from '@app/widgets/tokens-widget/tokens-widget';

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

    tokens.map(token => {
      if (token.symbol && cache[token.symbol]) {
        const item = cache[token.symbol];
        cache[token.symbol].value = new Balance(item.value).operate(
          token.value,
          'add',
        );
      } else {
        if (token.symbol) {
          cache[token.symbol] = token;
        }
      }
    });

    return Object.values(cache);
  }, [tokens]);

  if (tokens.length === 0) {
    return null;
  }
  return <TokensWidget onPress={openTotalValue} tokens={accumulatedTokens} />;
});
