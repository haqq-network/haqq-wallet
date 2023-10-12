import React, {useCallback, useEffect} from 'react';

import {observer} from 'mobx-react';

import {useTypedNavigation} from '@app/hooks';
import {Token} from '@app/models/tokens';
import {TokensWidget} from '@app/widgets/tokens-widget/tokens-widget';

export const TokensWidgetWrapper = observer(() => {
  const tokens = Token.getAllPositive();
  const navigation = useTypedNavigation();
  const openTotalValue = useCallback(() => {
    navigation.navigate('totalValueInfo');
  }, [navigation]);

  useEffect(() => {
    Token.fetchTokens();
  }, []);

  if (tokens.length === 0) {
    return null;
  }
  return <TokensWidget onPress={openTotalValue} tokens={tokens} />;
});
