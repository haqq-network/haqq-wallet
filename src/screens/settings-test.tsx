import React, {useCallback, useEffect, useState} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {
  accountInfo,
  derive,
  generateEntropy,
  generateMnemonicFromEntropy,
  seedFromMnemonic,
} from '@haqq/provider-web3-utils';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Metadata} from '@tkey/core';
import ThresholdKey from '@tkey/default';
import SecurityQuestionsModule from '@tkey/security-questions';
import TorusServiceProvider from '@tkey/service-provider-base';
import {ShareSerializationModule} from '@tkey/share-serialization';
import {ShareTransferModule} from '@tkey/share-transfer';
import TorusStorageLayer from '@tkey/storage-layer-torus';
import CustomAuth from '@toruslabs/customauth-react-native-sdk';
import BN from 'bn.js';
import {mnemonicToEntropy} from 'ethers/lib/utils';
import {Linking, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  Inline,
  Input,
  Spacer,
  Text,
} from '@app/components/ui';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme, showModal} from '@app/helpers';
import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {GoogleDrive} from '@app/services/google-drive';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {pushNotifications} from '@app/services/push-notifications';

messaging().onMessage(async remoteMessage => {
  console.log('onMessage', remoteMessage);
});

messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('onNotificationOpenedApp', remoteMessage);
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('setBackgroundMessageHandler', remoteMessage);
});

messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log('getInitialNotification', remoteMessage);
    }
  });

const GOOGLE_API = 'https://content.googleapis.com/';

type FilesResp = {
  files: Array<{
    id: string;
    name: string;
  }>;
};

type BackupResp = {
  content: string;
};

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

enum Providers {
  google,
}

const verifierMap = {
  [Providers.google]: {
    name: 'Google',
    typeOfLogin: 'google',
    clientId:
      '759944447575-6rm643ia1i9ngmnme3eq5viiep5rp6s0.apps.googleusercontent.com',
    verifier: 'sk-react-native-test',
  },
};

const METADATA_STORE = 'tkey_metadata';

export const SettingsTestScreen = () => {
  const [initialUrl, setInitialUrl] = useState<null | string>(null);
  const [wc, setWc] = useState('');
  const [googleBackup, setGoogleBackup] = useState<null | string>(null);
  const [googleBackupPhrase, setGoogleBackupPhrase] = useState('');
  const [inProgress, setInProgress] = useState(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(
    app.isGoogleSignedIn,
  );
  const [metadata, setMetadata] = useState(false);
  const [torusPk, setTorusPk] = useState(false);
  const [serializedShare, setSerializedShare] = useState('');
  const [pk, setPk] = useState('');
  const [hdPath, setHdPath] = useState("m/44'/60'/0'/0/0");
  const [address, setAddress] = useState('');

  const [loginProgress, setLoginProgress] = useState(false);
  const [createProgress, setCreateProgress] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(false);
  const [deserializeProgress, setDeserializeProgress] = useState(false);
  // const [share1, setShare1] = useState('');

  const onPressRequestPermissions = async () => {
    await pushNotifications.requestPermissions();
  };

  const onPressGoogleDriveLogin = useCallback(async () => {
    let user = null;

    try {
      user = await GoogleSignin.signInSilently();
    } catch (e) {
      user = await GoogleSignin.signIn();
    }

    app.isGoogleSignedIn = !!user;
    setIsGoogleSignedIn(!!user);

    const tokens = await GoogleSignin.getTokens();
    const filesResp = await fetch(
      `${GOOGLE_API}drive/v3/files?q=name%3D'haqq_backup.json'&fields=files(id%2Cname)`,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    );

    const files = (await filesResp.json()) as FilesResp;

    if (files.files.length) {
      setGoogleBackup(files.files[0].id);
    }
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then(result => {
      setInitialUrl(result);
    });

    try {
      AsyncStorage.getItem(METADATA_STORE)
        .then(resp => {
          console.log('metadata', resp);
          if (resp) {
            tKey.metadata = Metadata.fromJSON(JSON.parse(resp));
            setMetadata(!!tKey.metadata);
          }
        })
        .then(() => app.getPassword())
        .then(answerString =>
          securityQuestionsModule.inputShareFromSecurityQuestions(answerString),
        );
    } catch (error) {
      console.log(error, 'mounted caught');
    }
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then(result => {
      setInitialUrl(result);
    });

    GoogleSignin.configure({
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.appfolder',
        'https://www.googleapis.com/auth/drive.appdata',
      ],
    });

    if (app.isGoogleSignedIn) {
      onPressGoogleDriveLogin().then(() => {
        console.log('authorized');
      });
    }
  }, [onPressGoogleDriveLogin]);

  const onPressPasteGooglePhrase = useCallback(async () => {
    vibrate(HapticEffects.impactLight);
    const pasteString = await Clipboard.getString();
    setGoogleBackupPhrase(pasteString.trim());
  }, []);

  const onPressGoogleCreateBackupPhrase = useCallback(() => {}, []);

  const onPressGoogleUpdateBackupPhrase = useCallback(async () => {
    try {
      if (googleBackup) {
        setInProgress(true);
        const tokens = await GoogleSignin.getTokens();
        const gDrive = new GoogleDrive(tokens.accessToken);

        const data = await gDrive.uploadFile(
          googleBackup,
          'haqq_backup.json',
          JSON.stringify({
            content: googleBackupPhrase,
          }),
        );

        console.log('data', data);
      }
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    } finally {
      setInProgress(false);
    }
  }, [googleBackup, googleBackupPhrase]);
  const onPressGoogleGetBackupPhrase = useCallback(async () => {
    const tokens = await GoogleSignin.getTokens();

    const resp = await fetch(
      `${GOOGLE_API}drive/v3/files/${googleBackup}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    );

    const content = (await resp.json()) as BackupResp;

    setGoogleBackupPhrase(content.content ?? '');
  }, [googleBackup]);

  const updatePk = useCallback(() => {
    let privKey = tKey.privKey.toString('hex');

    if (privKey.length % 2 === 1) {
      privKey = `0${privKey}`;
    }

    setPk(privKey);
  }, []);

  const onPressCreateShares = useCallback(async () => {
    setCreateProgress(true);
    const answerString = await app.getPassword();

    let entropy;

    try {
      const accounts = await ProviderMnemonicReactNative.getAccounts();

      if (accounts.length) {
        const provider = new ProviderMnemonicReactNative({
          account: accounts[0],
          getPassword: app.getPassword.bind(app),
        });

        const phrase = await provider.getMnemonicPhrase();
        entropy = mnemonicToEntropy(phrase);
      } else {
        entropy = (await generateEntropy(32)).toString('hex');
      }

      if (entropy.startsWith('0x')) {
        entropy = entropy.slice(2);
      }

      await tKey._initializeNewKey({
        initializeModules: true,
        importedKey: new BN(entropy.padStart(64, '0'), 16),
      });

      const securityShare =
        await securityQuestionsModule.generateNewShareWithSecurityQuestions(
          answerString,
          'whats your password?',
        );

      console.log('securityShare', JSON.stringify(securityShare));

      const newShare = await tKey.generateNewShare();
      const polyId = tKey.metadata
        .getLatestPublicPolynomial()
        .getPolynomialID();

      const deviceShare =
        tKey.shares[polyId][newShare.newShareIndex.toString('hex')];

      const share = await (
        tKey.modules.shareSerializationModule as ShareSerializationModule
      ).serialize(deviceShare?.share.share as BN, 'mnemonic');

      console.log('deviceShare', JSON.stringify(deviceShare), share);

      setSerializedShare(share as string);

      Clipboard.setString(share as string);
      sendNotification(I18N.settingsTestShareCopied);

      await AsyncStorage.setItem(
        METADATA_STORE,
        JSON.stringify(tKey.getMetadata().toJSON()),
      );

      updatePk();
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    } finally {
      setCreateProgress(false);
    }
  }, [updatePk]);

  const onPressRestoreShare1 = useCallback(async () => {
    setRestoreProgress(true);
    await tKey.initialize();

    const answerString = await app.getPassword();
    await securityQuestionsModule.inputShareFromSecurityQuestions(answerString);

    await tKey.reconstructKey();
    updatePk();
    setRestoreProgress(false);
  }, [updatePk]);

  const onPressLogin = useCallback(async () => {
    try {
      setLoginProgress(true);
      const start = new Date();
      console.log(start);
      const loginDetails = await CustomAuth.triggerLogin(
        verifierMap[Providers.google],
      );

      tKey.serviceProvider.postboxKey = new BN(loginDetails.privateKey, 16);
      await tKey.initialize();
      const end = new Date();
      setMetadata(!!tKey.metadata);
      setTorusPk(true);
      console.log(end, +end - +start, JSON.stringify(loginDetails));
    } catch (e) {
      if (e instanceof Error) {
        console.log('onPressLogin', e.message);
      }
    } finally {
      setLoginProgress(false);
    }
  }, []);

  const onPressDeserialize = useCallback(async () => {
    setDeserializeProgress(true);
    if (serializedShare) {
      const deviceShare = await (
        tKey.modules.shareSerializationModule as ShareSerializationModule
      ).deserialize(serializedShare.trim(), 'mnemonic');

      await tKey.inputShare(deviceShare);
      await tKey.reconstructKey();

      updatePk();
    }

    setDeserializeProgress(false);
  }, [serializedShare, updatePk]);

  const onPressDerive = useCallback(async () => {
    console.log('pk', pk, Buffer.from(pk, 'hex'));
    const mnemonic = await generateMnemonicFromEntropy(Buffer.from(pk, 'hex'));
    console.log('mnemonic', mnemonic);
    const seed = await seedFromMnemonic(mnemonic);
    console.log('seed', seed);
    const privateKey = await derive(seed, hdPath);
    console.log('privateKey', privateKey);
    const account = await accountInfo(privateKey);

    if (account.address) {
      setAddress(account.address);
    }
  }, [hdPath, pk]);

  const onPressPaste = useCallback(async () => {
    vibrate(HapticEffects.impactLight);
    const pasteString = await Clipboard.getString();
    setSerializedShare(pasteString.trim());
  }, []);

  const onPressWc = () => {
    app.emit(Events.onWalletConnectUri, wc);
  };

  return (
    <View style={styles.container}>
      {initialUrl && (
        <Text t11 onPress={() => Clipboard.setString(initialUrl)}>
          initialUrl: {initialUrl}
        </Text>
      )}
      <Button
        title="Request permissions for push"
        onPress={onPressRequestPermissions}
        variant={ButtonVariant.contained}
      />
      <Spacer height={20} />

      <Input
        placeholder="wc:"
        value={wc}
        onChangeText={v => {
          setWc(v);
        }}
      />
      <Spacer height={5} />
      <Button
        title="wallet connect"
        disabled={!wc}
        onPress={onPressWc}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Show modal"
        onPress={() => showModal('ledger-locked')}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Text
        t11
        onPress={() => {
          Clipboard.setString(pk);
        }}>
        pk: {pk}
      </Text>
      <Spacer height={4} />
      <Button
        title="Login"
        loading={loginProgress}
        disabled={torusPk}
        onPress={onPressLogin}
        variant={ButtonVariant.contained}
      />
      <Spacer height={4} />
      <Button
        title="Create shares"
        loading={createProgress}
        disabled={!(metadata && torusPk)}
        onPress={onPressCreateShares}
        variant={ButtonVariant.contained}
      />
      <Spacer height={4} />
      <Button
        title="Restore from first share"
        disabled={!torusPk}
        loading={restoreProgress}
        onPress={onPressRestoreShare1}
        variant={ButtonVariant.contained}
      />
      <Spacer height={4} />
      <Input
        placeholder="share"
        value={serializedShare}
        onChangeText={v => {
          setSerializedShare(v);
        }}
        rightAction={
          <IconButton onPress={onPressPaste}>
            <Icon i24 name="paste" color={Color.graphicGreen1} />
          </IconButton>
        }
      />
      {/*<Spacer height={4} />*/}
      {/*<Button*/}
      {/*  title="Serialize"*/}
      {/*  disabled={!(metadata && !serializedShare && pk)}*/}
      {/*  onPress={onPressSerialize}*/}
      {/*  variant={ButtonVariant.contained}*/}
      {/*/>*/}
      <Spacer height={4} />
      <Button
        title="Deserialize"
        loading={deserializeProgress}
        disabled={!(metadata && serializedShare)}
        onPress={onPressDeserialize}
        variant={ButtonVariant.contained}
      />
      <Spacer height={4} />
      <Input
        placeholder="derive"
        value={hdPath}
        onChangeText={v => {
          setHdPath(v);
        }}
      />
      <Spacer height={4} />
      <Button
        title="Derive"
        disabled={!(hdPath && pk)}
        onPress={onPressDerive}
        variant={ButtonVariant.contained}
      />
      <Spacer height={4} />
      <Text
        t11
        onPress={() => {
          Clipboard.setString(address);
        }}>
        address: {address}
      </Text>
      <Spacer height={8} />
      {!isGoogleSignedIn && (
        <>
          <Button
            title="Signin to Google drive"
            onPress={onPressGoogleDriveLogin}
            variant={ButtonVariant.contained}
          />
          <Spacer height={4} />
        </>
      )}
      {isGoogleSignedIn && (
        <Input
          placeholder="google drive backup phrase"
          value={googleBackupPhrase}
          onChangeText={v => {
            setGoogleBackupPhrase(v);
          }}
          rightAction={
            <IconButton onPress={onPressPasteGooglePhrase}>
              <Icon i24 name="paste" color={Color.graphicGreen1} />
            </IconButton>
          }
        />
      )}
      {isGoogleSignedIn && googleBackup && (
        <>
          <Inline gap={8}>
            <Button
              title="Get backup phrase"
              onPress={onPressGoogleGetBackupPhrase}
              variant={ButtonVariant.contained}
            />
            <Button
              title="Update backup phrase"
              loading={inProgress}
              onPress={onPressGoogleUpdateBackupPhrase}
              variant={ButtonVariant.contained}
            />
          </Inline>
        </>
      )}
      {isGoogleSignedIn && !googleBackup && (
        <>
          <Button
            title="Create backup phrase"
            loading={inProgress}
            onPress={onPressGoogleCreateBackupPhrase}
            variant={ButtonVariant.contained}
          />
        </>
      )}
    </View>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
