import {memo, useEffect} from 'react';

import {GENERATE_SHARES_URL, METADATA_URL} from '@env';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';
import {mnemonicToEntropy} from 'ethers/lib/utils';

import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  SssMigrateStackParamList,
  SssMigrateStackRoutes,
} from '@app/screens/HomeStack/SssMigrate';
import {RemoteConfig} from '@app/services/remote-config';
import {WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '@app/variables/common';

export const SssMigrateStoreScreen = memo(() => {
  const route = useTypedRoute<
    SssMigrateStackParamList,
    SssMigrateStackRoutes.SssMigrateStore
  >();
  const navigation = useTypedNavigation<SssMigrateStackParamList>();

  useEffect(() => {
    showModal('loading', {text: getText(I18N.sssStoreWalletSaving)});
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      try {
        const storage = await getProviderStorage();

        const provider = await ProviderSSSReactNative.initialize(
          route.params.privateKey,
          route.params.cloudShare,
          route.params.localShare,
          null,
          route.params.verifier,
          route.params.token,
          app.getPassword.bind(app),
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
            const balance = app.getBalance(address);
            canNext = balance.isPositive() || index === 0;

            if (canNext) {
              await Wallet.create(
                {
                  address: address,
                  type: WalletType.sss,
                  path: hdPath,
                  accountId: provider.getIdentifier(),
                },
                name,
              );
            }
          }

          index += 1;
        }

        navigation.navigate('sssFinish');
      } catch (e) {
        Logger.log(e);
        switch (e) {
          case 'wallet_already_exists':
            showModal('errorAccountAdded');
            navigation.goBack();
            break;
          default:
            if (e instanceof Error) {
              showModal('errorCreateAccount');
              navigation.goBack();
              Logger.captureException(e, 'SssStoreWalletScreen');
            }
        }
      }
    }, 350);
  }, [navigation, route]);

  return null;
});
