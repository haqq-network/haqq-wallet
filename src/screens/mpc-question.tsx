import React, {useCallback, useEffect, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import ThresholdKey from '@tkey/default';
import SecurityQuestionsModule from '@tkey/security-questions';
import TorusServiceProvider from '@tkey/service-provider-base';
import {ShareSerializationModule} from '@tkey/share-serialization';
import {ShareTransferModule} from '@tkey/share-transfer';
import TorusStorageLayer from '@tkey/storage-layer-torus';
import BN from 'bn.js';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  Input,
  Loading,
  PopupContainer,
  Spacer,
} from '@app/components/ui';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

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

export const MpcQuestionScreen = () => {
  const [isPasswordExists, setIsPasswordExists] = useState(
    PasswordExists.checking,
  );
  const [password, setPassword] = useState('');
  const route = useTypedRoute<'mpcQuestion'>();
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

  const onPressPaste = useCallback(async () => {
    const pasteString = await Clipboard.getString();

    setPassword(pasteString);
  }, []);

  const onPressCheckPinCode = useCallback(async () => {
    try {
      const resp =
        await securityQuestionsModule.inputShareFromSecurityQuestions(password);
      console.log('onPressCheckPinCode', resp);

      navigation.navigate('onboardingSetupPin', {
        privateKey: route.params.privateKey,
        questionAnswer: password,
      });
    } catch (e) {
      if (e instanceof Error) {
        console.log('err', e.message);
      }
    }
  }, [navigation, password, route.params.privateKey]);

  if (isPasswordExists === PasswordExists.checking) {
    return (
      <PopupContainer>
        <Loading />
      </PopupContainer>
    );
  }

  return (
    <PopupContainer>
      <Input
        placeholder="password"
        value={password}
        onChangeText={v => {
          setPassword(v);
        }}
        rightAction={
          <IconButton onPress={onPressPaste}>
            <Icon i24 name="paste" color={Color.graphicGreen1} />
          </IconButton>
        }
      />
      <Spacer height={4} />
      <Button
        title="Check password"
        onPress={onPressCheckPinCode}
        variant={ButtonVariant.contained}
      />
    </PopupContainer>
  );
};
