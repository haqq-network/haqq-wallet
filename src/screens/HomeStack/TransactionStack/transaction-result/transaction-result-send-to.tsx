import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {AddressHighlight, TokenIcon} from '@app/components';
import {Spacer, Text, TextPosition, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {Balance} from '@app/services/balance';

import {TransactionStore} from '../transaction-store';

export const TransactionResultSendTo = observer(() => {
  const {toAddress, toAsset, toChainId, isCrossChain} = TransactionStore;
  const {transaction} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionResult
  >().params;

  const provider = useMemo(
    () => Provider.getByEthChainId(toChainId!),
    [toChainId],
  );
  const amount = useMemo(
    () => new Balance(transaction.value, provider?.decimals, provider?.denom),
    [transaction.value, provider],
  );

  return (
    <View>
      <View style={styles.wallet}>
        <AddressHighlight
          title={I18N.toProvider}
          address={toAddress}
          centered
        />
      </View>
      {isCrossChain && (
        <>
          <View style={styles.wallet}>
            <TokenIcon
              asset={toAsset}
              width={24}
              height={24}
              iconHeight={14}
              iconWidth={14}
            />
            <Spacer width={8} />
            <Text position={TextPosition.center} variant={TextVariant.t3}>
              {amount.toBalanceString()}
            </Text>
          </View>
          <Text
            position={TextPosition.center}
            variant={TextVariant.t15}
            color={Color.textBase2}
            i18n={I18N.approximatelyFiatAmount}
            i18params={{
              fiat: amount.toFiat() || '0',
            }}
          />
        </>
      )}
    </View>
  );
});

const styles = createTheme({
  text: {
    paddingTop: 16,
  },
  wallet: {
    flexDirection: 'row',
    paddingHorizontal: 60,
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});
