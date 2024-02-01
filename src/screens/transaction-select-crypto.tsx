import React, {useEffect, useMemo} from 'react';

import {computed} from 'mobx';
import {observer} from 'mobx-react';

import {TransactionSelectCrypto} from '@app/components/transaction-select-crypto';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Token} from '@app/models/tokens';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {IToken} from '@app/types';

export const TransactionSelectCryptoScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  const {params} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionSelectCrypto
  >();

  const tokens = useMemo(
    () =>
      computed(() =>
        Token.tokens[AddressUtils.toEth(params.from)].filter(
          item => !!item.is_in_white_list,
        ),
      ),
    [params.from],
  ).get();

  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useEffect(() => {
    Token.fetchTokens();
  }, []);

  const onItemPress = (token: IToken) => {
    navigation.navigate(TransactionStackRoutes.TransactionSum, {
      ...params,
      token,
    });
  };

  return <TransactionSelectCrypto tokens={tokens} onItemPress={onItemPress} />;
});
