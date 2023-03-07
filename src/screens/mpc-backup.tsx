import React, {useCallback, useEffect, useState} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import ThresholdKey from '@tkey/default';
import SecurityQuestionsModule from '@tkey/security-questions';
import TorusServiceProvider from '@tkey/service-provider-base';
import {ShareSerializationModule} from '@tkey/share-serialization';
import {ShareTransferModule} from '@tkey/share-transfer';
import TorusStorageLayer from '@tkey/storage-layer-torus';
import BN from 'bn.js';

import {MpcBackup} from '@app/components/mpc-backup';
import {app} from '@app/contexts';
import {captureException} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {GoogleDrive} from '@app/services/google-drive';

const serviceProvider = new TorusServiceProvider({
  customAuthArgs: {
    baseUrl: 'http://localhost:3000/serviceworker/',
    enableLogging: true,
    network: 'testnet',
  },
} as any);

const storageLayer = new TorusStorageLayer({
  hostUrl: 'https://metadata.tor.us',
});

const shareTransferModule = new ShareTransferModule();
const shareSerializationModule = new ShareSerializationModule();
const securityQuestionsModule = new SecurityQuestionsModule();

const tKey = new ThresholdKey({
  serviceProvider: serviceProvider,
  storageLayer,
  modules: {
    shareTransfer: shareTransferModule,
    shareSerializationModule: shareSerializationModule,
    securityQuestions: securityQuestionsModule,
  },
});

enum PasswordExists {
  checking,
  exists,
  not_exists,
}

export const MpcBackupScreen = () => {
  const [isPasswordExists, setIsPasswordExists] = useState(
    PasswordExists.checking,
  );

  const route = useTypedRoute<'mpcBackup'>();
  const navigation = useTypedNavigation();

  useEffect(() => {
    const run = async () => {
      try {
        tKey.serviceProvider.postboxKey = new BN(route.params.privateKey, 16);
        await tKey.initialize();

        securityQuestionsModule.getSecurityQuestions();
        setIsPasswordExists(PasswordExists.exists);
      } catch (e) {
        navigation.navigate('onboardingSetupPin', {
          privateKey: route.params.privateKey,
          questionAnswer: null,
        });
      }
    };

    run();
  }, [navigation, route.params.privateKey]);

  const onPressCheckPinCode = useCallback(
    async (password: string) => {
      try {
        await securityQuestionsModule.inputShareFromSecurityQuestions(password);

        navigation.navigate('onboardingSetupPin', {
          privateKey: route.params.privateKey,
          questionAnswer: password,
        });
      } catch (e) {
        if (e instanceof Error) {
          if ('code' in e && e.code === 2103) {
            throw new Error('wrong_password');
          } else {
            captureException(e, 'mpc backup check password');
          }
        }
      }
    },
    [navigation, route.params.privateKey],
  );

  const onPressCheckGoogleDrive = useCallback(async () => {
    try {
      const {address} = await accountInfo(
        route.params.privateKey.padStart(64, '0'),
      );

      const storage = await GoogleDrive.initialize();
      app.isGoogleSignedIn = true;
      const share = await storage.getItem(`haqq_${address}`);

      if (share) {
        navigation.navigate('onboardingSetupPin', {
          privateKey: route.params.privateKey,
          cloudShare: share,
        });
      }
    } catch (e) {
      if (e instanceof Error) {
        console.log('err', e.message);
      }
    }
  }, [navigation, route.params.privateKey]);

  const onPressContinue = useCallback(() => {
    navigation.navigate('onboardingSetupPin', {
      privateKey: route.params.privateKey,
    });
  }, [navigation, route.params.privateKey]);

  return (
    <MpcBackup
      isPasswordExists={isPasswordExists}
      onCheckPassword={onPressCheckPinCode}
      onCheckGoogleDrive={onPressCheckGoogleDrive}
      onSkip={onPressContinue}
    />
  );
};
