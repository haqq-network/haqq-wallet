import {useCallback} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {Spacer} from '@app/components/ui';
import {WalletRow, WalletRowTypes} from '@app/components/wallet-row';
import {awaitForWallet, createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {HeaderButtonProps} from '@app/types';

import {TransactionStore} from '../transaction-store';

type TransactionAmountRightHeaderOptionsProps = HeaderButtonProps & {
  onClose?: () => void;
};

export const TransactionAmountRightHeaderOptions = observer(
  (props: TransactionAmountRightHeaderOptionsProps) => {
    const {fromWallet, fromChainId} = TransactionStore;

    const onPressWallet = useCallback(async (accountId: string) => {
      TransactionStore.fromAddress = await awaitForWallet({
        wallets: Wallet.getAllVisible(),
        title: I18N.selectAccount,
        autoSelectWallet: false,
        initialAddress: accountId,
        hideBalance: true,
        chainId: fromChainId!,
      });
    }, []);

    return (
      <View style={styles.container}>
        <WalletRow
          type={WalletRowTypes.variant3}
          item={fromWallet!}
          onPress={onPressWallet}
          chainId={fromChainId!}
        />
        <Spacer width={10} />
        <DismissPopupButton {...props} />
      </View>
    );
  },
);

const styles = createTheme({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
