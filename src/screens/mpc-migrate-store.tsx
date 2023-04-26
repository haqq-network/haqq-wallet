import React, {useEffect} from 'react';

import {GENERATE_SHARES_URL, METADATA_URL} from '@env';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';
import {mnemonicToEntropy} from 'ethers/lib/utils';

import {app} from '@app/contexts';
import {captureException, showModal} from '@app/helpers';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';

export const MpcMigrateStoreScreen = () => {
  const route = useTypedRoute<'mpcMigrateStore'>();
  const navigation = useTypedNavigation();

  useEffect(() => {
    showModal('loading', {text: getText(I18N.mpcStoreWalletSaving)});
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      try {
        console.log('MpcMigrateStoreScreen 1');
        const storage = await getProviderStorage();
        console.log('MpcMigrateStoreScreen 2');
        const getPassword = app.getPassword.bind(app);
        console.log('MpcMigrateStoreScreen 3');

        const mnemonicProvider = new ProviderMnemonicReactNative({
          account: route.params.accountId,
          getPassword,
        });

        console.log('MpcMigrateStoreScreen 4');

        const mnemonic = await mnemonicProvider.getMnemonicPhrase();

        console.log('MpcMigrateStoreScreen 5');

        let entropy = mnemonicToEntropy(mnemonic);

        console.log('MpcMigrateStoreScreen 6');

        if (entropy.startsWith('0x')) {
          entropy = entropy.slice(2);
        }

        console.log('MpcMigrateStoreScreen 7');

        entropy = entropy.padStart(64, '0');
        console.log('MpcMigrateStoreScreen 8');

        const provider = await ProviderMpcReactNative.initialize(
          route.params.privateKey,
          null,
          entropy,
          route.params.verifier,
          route.params.token,
          app.getPassword.bind(app),
          storage,
          {metadataUrl: METADATA_URL, generateSharesUrl: GENERATE_SHARES_URL},
        );

        console.log('MpcMigrateStoreScreen 9');

        const wallets = Wallet.getAll();

        console.log('MpcMigrateStoreScreen 10');

        for (const wallet of wallets) {
          if (
            wallet.accountId === route.params.accountId &&
            wallet.type === WalletType.mnemonic
          ) {
            wallet.update({
              type: WalletType.mpc,
              accountId: provider.getIdentifier(),
            });
          }
        }

        navigation.navigate('mpcMigrateFinish');
      } catch (e) {
        if (e instanceof Error) {
          showModal('error-create-account');
          navigation.getParent()?.goBack();
          captureException(e, 'mpcStore');
        }
      }
    }, 350);
  }, [navigation, route]);

  return <></>;
};
