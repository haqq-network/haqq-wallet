import React, {useCallback} from 'react';

import {ProviderMnemonicBase} from '@haqq/rn-wallet-providers';
import Clipboard from '@react-native-clipboard/clipboard';
import {View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {
  Button,
  ButtonVariant,
  NoInternetIcon,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {
  awaitForWallet,
  createTheme,
  getProviderInstanceForWallet,
  hideModal,
} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {sendNotification} from '@app/services';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType, Modals, WalletType} from '@app/types';

import {BottomPopupContainer} from '../bottom-popups';

export const NoInternet = ({
  showClose = false,
}: Modals[ModalType.noInternet]) => {
  const copyMnemonic = useCallback(async () => {
    const wallets = Wallet.getAll().filter(
      it => it.type === WalletType.mnemonic,
    );

    const wallet = await awaitForWallet({
      wallets,
      title: I18N.selectAccount,
    });

    const network = Provider.getAll().find(
      it => it.isHaqqNetwork && it.isMainnet,
    );

    const walletModel = Wallet.getById(wallet)!;
    const walletProvider = await getProviderInstanceForWallet(
      walletModel,
      true,
      network,
    );

    if (!(walletProvider instanceof ProviderMnemonicBase)) {
      throw new Error('wallet_not_supported');
    }

    const mnemonic = await walletProvider.getMnemonicPhrase();
    Clipboard.setString(mnemonic);
    vibrate(HapticEffects.success);
    sendNotification(I18N.notificationCopied);
  }, []);

  return (
    <BottomPopupContainer>
      {() => (
        <View style={page.modalView}>
          <Text
            variant={TextVariant.t5}
            position={TextPosition.center}
            i18n={I18N.noInternetPopupTitle}
          />
          <Text
            variant={TextVariant.t14}
            position={TextPosition.center}
            style={page.descriptionText}
            i18n={I18N.noInternetPopupDescription}
          />
          <NoInternetIcon
            color={getColor(Color.graphicSecond4)}
            style={page.icon}
          />
          {showClose && (
            <Button
              variant={ButtonVariant.second}
              title="OK"
              onPress={() => hideModal(ModalType.noInternet)}
              style={page.closeButton}
            />
          )}
          <Spacer height={32} />
          <Button
            variant={ButtonVariant.contained}
            title="Export mnemonic"
            onPress={copyMnemonic}
            style={page.button}
          />
        </View>
      )}
    </BottomPopupContainer>
  );
};

const page = createTheme({
  closeButton: {
    width: '100%',
    marginTop: 10,
  },
  descriptionText: {
    paddingTop: 6,
    width: 290,
  },
  icon: {
    marginTop: 24,
  },
  button: {
    width: '100%',
  },
  modalView: {
    backgroundColor: Color.bg1,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
    justifyContent: 'center',
    minHeight: 298,
  },
});
