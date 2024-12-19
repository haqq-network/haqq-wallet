import React, {useEffect, useMemo} from 'react';

import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {View} from 'react-native';

import {TransactionSelectCrypto} from '@app/components/transaction-select-crypto';
import {Spacer} from '@app/components/ui';
import {Placeholder} from '@app/components/ui/placeholder';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Provider} from '@app/models/provider';
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
      computed(
        () =>
          Token.tokens[AddressUtils.toEth(params.from)]?.filter(
            item =>
              !!item.is_in_white_list && !item.is_erc721 && !item.is_erc1155,
          ) ?? [],
      ),
    [params.from, Provider.selectedProvider.denom],
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

  if (Token.isLoading && !tokens.length) {
    return Array.from({length: 6}).map((_, index) => (
      <View key={index} style={styles.placeholderContainer}>
        <View style={styles.placeholderLeft}>
          <Placeholder>
            <Placeholder.Item width={48} height={48} />
          </Placeholder>
          <Spacer width={20} />
          <View style={styles.placeholderRows}>
            <Placeholder>
              <Placeholder.Item width={60} height={20} />
            </Placeholder>
            <Placeholder>
              <Placeholder.Item width={120} height={20} />
            </Placeholder>
          </View>
        </View>
        <Placeholder>
          <Placeholder.Item width={50} height={20} />
        </Placeholder>
      </View>
    ));
  }

  return <TransactionSelectCrypto tokens={tokens} onItemPress={onItemPress} />;
});

const styles = createTheme({
  placeholderContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  placeholderRows: {
    height: 48,
    justifyContent: 'space-around',
  },
  placeholderLeft: {
    flexDirection: 'row',
  },
});
