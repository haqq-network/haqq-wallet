import {useEffect} from 'react';

import {GENERATE_SHARES_URL, METADATA_URL} from '@env';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';
import {mnemonicToEntropy} from 'ethers/lib/utils';
import {observer} from 'mobx-react';

import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {ErrorHandler} from '@app/models/errorHandler';
import {Wallet} from '@app/models/wallet';
import {
  SssMigrateStackParamList,
  SssMigrateStackRoutes,
} from '@app/screens/HomeStack/SssMigrate';
import {RemoteConfig} from '@app/services/remote-config';
import {ModalType} from '@app/types';
import {WalletType} from '@app/types';

export const SssMigrateStoreScreen = observer(() => {
  const route = useTypedRoute<
    SssMigrateStackParamList,
    SssMigrateStackRoutes.SssMigrateStore
  >();
  const navigation = useTypedNavigation<SssMigrateStackParamList>();

  useEffect(() => {
    showModal(ModalType.loading, {text: getText(I18N.sssStoreWalletSaving)});
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      try {
        const storage = await getProviderStorage();
        const getPassword = app.getPassword.bind(app);

        const mnemonicProvider = new ProviderMnemonicReactNative({
          account: route.params.accountId,
          getPassword,
        });

        const mnemonic = await mnemonicProvider.getMnemonicPhrase();

        let entropy = mnemonicToEntropy(mnemonic);

        if (entropy.startsWith('0x')) {
          entropy = entropy.slice(2);
        }

        entropy = entropy.padStart(64, '0');

        const provider = await ProviderSSSReactNative.initialize(
          route.params.privateKey,
          null,
          null,
          entropy,
          route.params.verifier,
          route.params.token,
          getPassword,
          storage,
          {
            metadataUrl: RemoteConfig.get_env(
              'sss_metadata_url',
              METADATA_URL,
            ) as string,
            generateSharesUrl: RemoteConfig.get_env(
              'sss_generate_shares_url',
              GENERATE_SHARES_URL,
            ) as string,
          },
        ).catch(() => ErrorHandler.handle('sssLimitReached'));
        if (!provider) {
          hideModal(ModalType.loading);
          navigation.goBack();
          return;
        }

        const wallets = Wallet.getAll();

        for (const wallet of wallets) {
          if (
            wallet.accountId === route.params.accountId &&
            wallet.type === WalletType.mnemonic
          ) {
            Wallet.update(wallet.address, {
              type: WalletType.sss,
              accountId: provider.getIdentifier(),
              socialLinkEnabled: true,
            });
          }
        }

        navigation.navigate(SssMigrateStackRoutes.SssMigrateFinish);
      } catch (e) {
        if (e instanceof Error) {
          showModal(ModalType.errorCreateAccount);
          navigation.goBack();
          Logger.captureException(e, 'SssMigrateStoreScreen');
        }
      } finally {
        hideModal(ModalType.loading);
      }
    }, 350);
  }, [navigation, route]);

  return null;
});
