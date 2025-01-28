import {useMemo} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {Text, TextPosition, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Balance} from '@app/services/balance';

import {TransactionStore} from '../../transaction-store';

export const TransactionPreviewSingleChainFrom = observer(() => {
  const {fromAmount, wallet, fromChainId} = TransactionStore;

  const provider = useMemo(
    () => Provider.getByEthChainId(fromChainId!),
    [fromChainId],
  );
  const amount = useMemo(
    () => new Balance(Number(fromAmount), provider?.decimals, provider?.denom),
    [fromAmount, provider],
  );

  return (
    <View>
      <Text
        position={TextPosition.center}
        variant={TextVariant.t11}
        color={Color.textBase2}
        i18n={I18N.totalAmountFrom}
        style={styles.totalFromText}
      />
      <View style={styles.wallet}>
        <Text
          position={TextPosition.center}
          variant={TextVariant.t13}>{`${wallet.name} `}</Text>
        <Text position={TextPosition.center} variant={TextVariant.t11}>
          {shortAddress(wallet.address, '•', false, 3)}
        </Text>
      </View>
      <Text position={TextPosition.center} variant={TextVariant.t3}>
        {amount.toBalanceString()}
      </Text>
      <Text position={TextPosition.center} variant={TextVariant.t15}>
        {amount.toFiat()}
      </Text>
    </View>
  );
});

const styles = createTheme({
  totalFromText: {
    paddingTop: 16,
  },
  wallet: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    alignItems: 'baseline',
    paddingVertical: 4,
  },
});
