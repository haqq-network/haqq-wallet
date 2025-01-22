import {useCallback} from 'react';

import {observer} from 'mobx-react';
import {ScrollView, View} from 'react-native';

import {AddressHighlight, TokenIcon} from '@app/components';
import {Button, ButtonVariant, Spacer, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {TransactionPreviewSingleChainFrom} from './transaction-preview-single-chain-from';
import {TransactionPreviewSingleChainInfo} from './transaction-preview-single-chain-info';

import {TransactionStore} from '../../transaction-store';

export const TransactionPreviewSingleChain = observer(() => {
  const {fromAsset, toAddress} = TransactionStore;

  const onSendPress = useCallback(() => {}, []);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollView}>
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
        <Spacer height={24} />
        <TransactionPreviewSingleChainInfo />
      </ScrollView>
      <Button
        variant={ButtonVariant.contained}
        i18n={I18N.transactionSumSendTitle}
        onPress={onSendPress}
        style={styles.submit}
      />
    </View>
  );
});

const styles = createTheme({
  screen: {
    paddingHorizontal: 20,
    flex: 1,
    paddingBottom: 16,
  },
  scrollView: {
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
