import {observer} from 'mobx-react';
import {View} from 'react-native';

import {AddressHighlight, TokenIcon} from '@app/components';
import {KeyboardSafeArea, Spacer, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {TransactionPreviewSingleChainFrom} from './transaction-preview-single-chain-from';

import {TransactionStore} from '../../transaction-store';

export const TransactionPreviewSingleChain = observer(() => {
  const {fromAsset, toAddress} = TransactionStore;

  return (
    <KeyboardSafeArea style={styles.screen}>
      <TokenIcon
        asset={fromAsset}
        width={64}
        height={64}
        viewStyle={styles.icon}
      />
      <TransactionPreviewSingleChainFrom />
      <Spacer height={16} />
      <View style={styles.sendToContainer}>
        <AddressHighlight
          title={I18N.transactionAddressSendTo}
          address={toAddress}
          centered
          subtitleProps={{
            variant: TextVariant.t11,
          }}
        />
      </View>
    </KeyboardSafeArea>
  );
});

const styles = createTheme({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  icon: {
    position: 'relative',
  },
  sendToContainer: {
    width: '60%',
    alignItems: 'center',
  },
  submit: {
    marginVertical: 16,
  },
});
