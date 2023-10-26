import React, {useEffect} from 'react';

import {observer} from 'mobx-react';

import {TransactionSelectCrypto} from '@app/components/transaction-select-crypto';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Token} from '@app/models/tokens';
import {IToken} from '@app/types';

export const TransactionSelectCryptoScreen = observer(() => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'transactionSelectCrypto'>();

  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useEffect(() => {
    Token.fetchTokens();
  }, []);

  const onItemPress = (token: IToken) => {
    navigation.navigate('transactionSum', {...params, token});
  };

  return (
    <TransactionSelectCrypto
      tokens={Token.tokens[params.from]}
      onItemPress={onItemPress}
    />
  );
});
