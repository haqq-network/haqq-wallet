import React, {useCallback, useEffect, useState} from 'react';

import {initializeTKey} from '@haqq/provider-mpc-react-native';
import {accountInfo} from '@haqq/provider-web3-utils';

import {MpcBackup} from '@app/components/mpc-backup';
import {app} from '@app/contexts';
import {captureException} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {GoogleDrive} from '@app/services/google-drive';
import {
  serviceProviderOptions,
  storageLayerOptions,
} from '@app/services/provider-mpc';

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
        const {securityQuestionsModule} = await initializeTKey(
          route.params.privateKey,
          serviceProviderOptions as any,
          storageLayerOptions,
        );

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
        const {securityQuestionsModule} = await initializeTKey(
          route.params.privateKey,
          serviceProviderOptions as any,
          storageLayerOptions,
        );

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

      const storage = new GoogleDrive();
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
