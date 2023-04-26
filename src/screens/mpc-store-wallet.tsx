import React, {useEffect} from 'react';

import {GENERATE_SHARES_URL, METADATA_URL} from '@env';
import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';

import {app} from '@app/contexts';
import {captureException, showModal} from '@app/helpers';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {EthNetwork} from '@app/services';
import {WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '@app/variables/common';

export const MpcStoreWalletScreen = () => {
  const route = useTypedRoute<'mpcStoreWallet'>();
  const wallets = useWallets();
  const navigation = useTypedNavigation();

  useEffect(() => {
    showModal('loading', {text: getText(I18N.mpcStoreWalletSaving)});
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      try {
        const storage = await getProviderStorage();

        const provider = await ProviderMpcReactNative.initialize(
          route.params.privateKey,
          route.params.cloudShare,
          null,
          route.params.verifier,
          route.params.token,
          app.getPassword.bind(app),
          storage,
          {metadataUrl: METADATA_URL, generateSharesUrl: GENERATE_SHARES_URL},
        );

        let canNext = true;
        let index = 0;

        while (canNext) {
          const total = Wallet.getAll().length;

          const name =
            total === 0
              ? MAIN_ACCOUNT_NAME
              : getText(I18N.signinStoreWalletAccountNumber, {
                  number: `${total + 1}`,
                });

          const hdPath = `${ETH_HD_SHORT_PATH}/${index}`;

          const {address} = await provider.getAccountInfo(hdPath);

          if (!Wallet.getById(address)) {
            const balance = await EthNetwork.getBalance(address);
            canNext = balance > 0 || index === 0;

            if (canNext) {
              await wallets.addWallet(
                {
                  address: address,
                  type: WalletType.mpc,
                  path: hdPath,
                  accountId: provider.getIdentifier(),
                },
                name,
              );
            }
          }

          index += 1;
        }

        navigation.navigate('mpcFinish');
      } catch (e) {
        console.log(e);
        switch (e) {
          case 'wallet_already_exists':
            showModal('error-account-added');
            navigator.goBack();
            break;
          default:
            if (e instanceof Error) {
              console.log('error.message', e.message);
              showModal('error-create-account');
              navigator.goBack();
              captureException(e, 'mpcStore');
            }
        }
      }
    }, 350);
  }, [navigation, route, wallets]);

  return <></>;
};
