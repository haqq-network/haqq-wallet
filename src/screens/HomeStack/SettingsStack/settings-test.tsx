import React, {useCallback, useEffect, useState} from 'react';

import {HAQQ_BACKEND, HAQQ_BACKEND_DEV} from '@env';
import {useActionSheet} from '@expo/react-native-action-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import messaging from '@react-native-firebase/messaging';
import {utils} from 'ethers';
import {observer} from 'mobx-react';
import {Alert, Platform, ScrollView} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {
  PlayInstallReferrer,
  PlayInstallReferrerError,
  PlayInstallReferrerInfo,
} from 'react-native-play-install-referrer';
import shajs from 'sha.js';

import {CaptchaType} from '@app/components/captcha';
import {Button, ButtonVariant, Input, Spacer, Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {onDeepLink} from '@app/event-actions/on-deep-link';
import {Events} from '@app/events';
import {
  awaitForWallet,
  createTheme,
  getProviderInstanceForWallet,
  getWindowHeight,
  hideModal,
  showModal,
} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {awaitForScanQr} from '@app/helpers/await-for-scan-qr';
import {
  awaitForValue,
  objectsToValues,
  stringsToValues,
} from '@app/helpers/await-for-value';
import {getUid} from '@app/helpers/get-uid';
import {getAdjustAdid} from '@app/helpers/get_adjust_adid';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {News} from '@app/models/news';
import {Provider} from '@app/models/provider';
import {Refferal} from '@app/models/refferal';
import {RssNews} from '@app/models/rss-news';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {SettingsStackParamList} from '@app/screens/HomeStack/SettingsStack';
import {EthNetwork} from '@app/services';
import {Airdrop} from '@app/services/airdrop';
import {Balance} from '@app/services/balance';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {SssProviders} from '@app/services/provider-sss';
import {message as toastMessage} from '@app/services/toast';
import {getUserAgent} from '@app/services/version';
import {ModalType, Modals, PartialJsonRpcRequest} from '@app/types';
import {
  generateMockBanner,
  isError,
  makeID,
  openInAppBrowser,
  openWeb3Browser,
} from '@app/utils';
import {MIN_GAS_LIMIT} from '@app/variables/balance';
import {HAQQ_METADATA, TEST_URLS} from '@app/variables/common';

const logger = Logger.create('SettingsTestScreen', {
  emodjiPrefix: '🔵',
  stringifyJson: true,
});

messaging().setBackgroundMessageHandler(async () => {
  // logger.log('setBackgroundMessageHandler', remoteMessage);
});

messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      // logger.log('getInitialNotification', remoteMessage);
    }
  });

type TestModals = {
  [key in keyof Modals]: Modals[key] | null;
};

// When adding a new modal, popup, or bottom sheet, ensure to declare the modal props example in this function.
const getTestModals = (): TestModals => {
  const wallets = Wallet.getAllVisible();
  const firstWalletAddress = wallets[0].address;
  const providers = Provider.getAll();
  const firstProviderId = providers[0].id;

  // Generate props for modals
  const modals: TestModals = {
    // Modals that are not currently being used are set to null.
    splash: null,
    pin: null,
    // The following modals are conditionally rendered based on certain circumstances.
    // They are placed here for better visibility and easier understanding.
    cardDetailsQr: null,
    walletsBottomSheet: null,
    providersBottomSheet: null,
    // Other modals props.
    noInternet: {showClose: true},
    loading: {
      text: 'a few moment later...',
    },
    error: {
      onClose: () => {
        hideModal(ModalType.loading);
      },
      title: 'Something went wrong',
      description: 'Please try again later',
      close: 'OK',
    },
    qr: {
      onClose: () => logger.log('qr closed'),
    },
    bluetoothPoweredOff: {
      onClose: () => logger.log('bluetoothPoweredOff closed'),
    },
    bluetoothUnauthorized: {
      onClose: () => logger.log('bluetoothUnauthorized closed'),
    },
    domainBlocked: {
      onClose: () => logger.log('domainBlocked closed'),
      domain: 'example.com',
    },
    ledgerNoApp: {
      onClose: () => logger.log('ledgerNoApp closed'),
      onRetry: Promise.resolve,
    },
    ledgerAttention: {
      onClose: () => logger.log('ledgerAttention closed'),
    },
    ledgerLocked: {
      onClose: () => logger.log('ledgerLocked closed'),
    },
    errorAccountAdded: {
      onClose: () => logger.log('errorAccountAdded closed'),
    },
    errorCreateAccount: {
      onClose: () => logger.log('errorCreateAccount closed'),
    },
    claimOnMainnet: {
      onClose: () => logger.log('claimOnMainnet closed'),
      onChange: () => logger.log('claimOnMainnet onChange'),
      network: 'MainMet',
    },
    transactionError: {
      onClose: () => logger.log('transactionError closed'),
      message: 'Something went wrong',
    },
    locationUnauthorized: {
      onClose: () => logger.log('locationUnauthorized closed'),
    },
    raffleAgreement: {
      onClose: () => logger.log('raffleAgreement closed'),
    },
    captcha: {
      onClose: () => logger.log('captcha closed'),
      variant: CaptchaType.slider,
    },
    cloudVerification: {
      showClose: true,
      sssProvider: Platform.select({
        android: SssProviders.google,
        default: SssProviders.apple,
      }),
    },
    lockedTokensInfo: {
      onClose: () => logger.log('lockedTokensInfo closed'),
    },
    notEnoughGas: {
      currentAmount: app.getBalanceData(firstWalletAddress).available,
      gasLimit: MIN_GAS_LIMIT,
      onClose: () => logger.log('notEnoughGas closed'),
    },
    viewErrorDetails: {
      errorDetails: 'viewErrorDetails',
      onClose: () => logger.log('viewErrorDetails closed'),
    },
    cloudShareNotFound: {
      onClose: () => logger.log('cloudShareNotFound closed'),
      wallet: wallets[0],
    },
    sssLimitReached: {
      onClose: () => logger.log('sssLimitReached closed'),
    },
  };

  if (wallets.length) {
    modals.walletsBottomSheet = {
      wallets,
      title: I18N.welcomeTitle,
      autoSelectWallet: false,
      successEventName: 'test-succes-event',
      errorEventName: 'test-error-event',
      closeDistance: () => getWindowHeight() / 6,
      onClose: () => logger.log('walletsBottomSheet closed'),
    };
  }

  if (firstWalletAddress) {
    modals.cardDetailsQr = {
      address: firstWalletAddress,
      onClose: () => logger.log('cardDetailsQr closed'),
    };
  }

  if (firstProviderId) {
    modals.providersBottomSheet = {
      title: I18N.welcomeTitle,
      providers,
      initialProviderId: firstProviderId,
      eventSuffix: '-test',
      closeDistance: () => getWindowHeight() / 6,
      onClose: () => logger.log('providersBottomSheet closed'),
    };
  }

  return Object.fromEntries(
    Object.entries(modals).filter(([_, v]) => !!v),
  ) as TestModals;
};

const abi = [
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_count',
        type: 'uint256',
      },
    ],
    name: 'mintNFTs',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
    payable: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'tokensOfOwner',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
];

const BACKENDS = [
  ['production', HAQQ_BACKEND],
  ['development', HAQQ_BACKEND_DEV],
];

async function callContract(to: string, func: string, ...params: any[]) {
  const iface = new utils.Interface(abi);
  logger.log('params', params);
  const data = iface.encodeFunctionData(func, params);

  const resp = await EthNetwork.call(to, data);
  return iface.decodeFunctionResult(func, resp);
}

const Title = ({text = ''}) => (
  <>
    <Spacer height={10} />
    <Text t10 children={text} />
    <Spacer height={5} />
  </>
);

export const SettingsTestScreen = observer(() => {
  const {showActionSheetWithOptions} = useActionSheet();
  const [wc, setWc] = useState('');
  const [rawSignData, setRawSignData] = useState('');
  const [signData, setSignData] = useState<PartialJsonRpcRequest>();
  const [isValidRawSignData, setValidRawSignData] = useState(false);
  const [deeplink, setDeeplink] = useState('');
  const [regexp, setRegexp] = useState('');
  const [browserUrl, setBrowserUrl] = useState('');
  const [contract] = useState('0xB641EcDDdE1C0A9cC83B70B15eC9789c1365B3d2');
  const navigation = useTypedNavigation<SettingsStackParamList>();
  const [newsCount, setNewsCount] = useState(News.getAll().length);
  const [rssNewsCount, setRssNewsCount] = useState(RssNews.getAll().length);
  const [backend, setBackend] = useState(app.backend);
  const [uid, setUid] = useState<null | string>(null);
  const [adid, setAdid] = useState<null | string>(null);
  const [leadingAccount, setLeadingAccount] = useState(
    VariablesString.get('leadingAccount'),
  );
  const [refInfo, setRefInfo] = useState<
    PlayInstallReferrerInfo | PlayInstallReferrerError | null
  >(null);

  useEffect(() => {
    getUid().then(id => {
      setUid(id);
    });

    getAdjustAdid().then(id => {
      setAdid(id);
    });

    PlayInstallReferrer.getInstallReferrerInfo((installReferrerInfo, error) => {
      setRefInfo(error || installReferrerInfo);
    });
  }, []);

  const onTurnOffDeveloper = useCallback(() => {
    app.isDeveloper = false;
    navigation.goBack();
  }, [navigation]);

  const onPressWc = () => {
    app.emit(Events.onWalletConnectUri, wc);
  };

  const onPressDeepLink = useCallback(async () => {
    try {
      const handled = await onDeepLink(deeplink);
      if (handled) {
        toastMessage('✅ link successfully handled');
      } else {
        toastMessage('❌ not handled');
      }
    } catch (err) {
      if (isError(err)) {
        Alert.alert('onDeepLink error', JSON.stringify(err, null, 2));
      }
    }
  }, [deeplink]);

  const onPressOpenInAppBrowser = () => {
    openInAppBrowser(browserUrl);
  };

  const onPressOpenWeb3Browser = () => {
    openWeb3Browser(browserUrl);
  };

  const onCallContract = async () => {
    const iface = new utils.Interface(abi);
    const data = iface.encodeFunctionData('tokensOfOwner', [
      '0x6e03A60fdf8954B4c10695292Baf5C4bdC34584B',
    ]);

    const resp = await EthNetwork.call(contract, data);
    logger.log('resp', resp);
    const r = iface.decodeFunctionResult('tokensOfOwner', resp);

    logger.log(JSON.stringify(r));
  };

  const onMintContract = async () => {
    const iface = new utils.Interface(abi);
    const data = iface.encodeFunctionData('mintNFTs', [1]);

    logger.log('data', data);

    const walletId = await awaitForWallet({
      wallets: Wallet.getAll(),
      title: I18N.stakingDelegateAccountTitle,
    });

    const wallet = Wallet.getById(walletId);

    if (!wallet) {
      return;
    }

    const transport = await getProviderInstanceForWallet(wallet);

    const unsignedTx = await EthNetwork.populateTransaction(
      wallet.address,
      contract,
      new Balance(100000000000000, 0),
      data,
      new Balance(250000, 0),
    );

    const signedTx = await transport.signTransaction(wallet.path!, unsignedTx);
    Logger.log('signedTx', signedTx);

    const resp = await EthNetwork.sendTransaction(signedTx);

    logger.log('resp', resp);
    const r = iface.decodeFunctionData('mintNFTs', resp.data);

    logger.log(JSON.stringify(r));
  };

  const onCheckContract = useCallback(async () => {
    const code = await EthNetwork.getCode(contract);
    logger.log('code', code);

    const interfaces = await callContract(
      contract,
      'supportsInterface',
      0x80ac58cd,
    );

    logger.log('interfaces', ...interfaces);

    const name = await callContract(contract, 'name');
    logger.log('name', ...name);

    const symbol = await callContract(contract, 'symbol');
    logger.log('symbol', ...symbol);
  }, [contract]);

  const onResetUid = useCallback(async () => {
    const newUid = shajs('sha256').update(makeID(10)).digest('hex');
    await EncryptedStorage.setItem('uid', newUid);
  }, []);

  const onClearBanners = useCallback(() => {
    Banner.removeAll();
  }, []);

  const onClearReferrals = useCallback(() => {
    Refferal.removeAll();
  }, []);

  const onSetBackend = useCallback(() => {
    const modalsKeys = BACKENDS.map(([title]) => title);
    showActionSheetWithOptions({options: modalsKeys}, index => {
      if (typeof index === 'number' && BACKENDS[index]) {
        app.backend = BACKENDS[index][1];
        setBackend(app.backend);
      }
    });
  }, [showActionSheetWithOptions]);

  const onSetLeadingAccount = useCallback(async () => {
    const wallets = Wallet.getAll();
    const initialAddress = VariablesString.get('leadingAccount');

    const selectedAccount = await awaitForWallet({
      wallets,
      title: I18N.selectAccount,
      autoSelectWallet: false,
      initialAddress,
    });
    VariablesString.set('leadingAccount', selectedAccount);
    setLeadingAccount(VariablesString.get('leadingAccount'));
  }, [showActionSheetWithOptions]);

  return (
    <ScrollView style={styles.container}>
      <Title text="Install Referrer" />
      <Text
        t11
        onPress={() => {
          Clipboard.setString(JSON.stringify(refInfo));
          toastMessage('Copied to clipboard');
        }}>
        {JSON.stringify(refInfo)}
      </Text>
      <Spacer height={8} />
      {uid && (
        <>
          <Title text="uid" />
          <Text
            t11
            onPress={() => {
              Clipboard.setString(uid);
              toastMessage('Copied to clipboard');
            }}>
            {uid}
          </Text>
          <Spacer height={8} />
        </>
      )}
      {adid && (
        <>
          <Title text="adid" />
          <Text
            t11
            onPress={() => {
              Clipboard.setString(adid);
              toastMessage('Copied to clipboard');
            }}>
            {adid}
          </Text>
          <Spacer height={8} />
        </>
      )}
      <Title text="user agent" />
      <Text
        t11
        onPress={() => {
          Clipboard.setString(getUserAgent());
          toastMessage('Copied to clipboard');
        }}>
        {getUserAgent()}
      </Text>
      <Spacer height={8} />
      <Title text="Backend" />
      <Text t11>{backend}</Text>
      <Spacer height={8} />
      <Button
        title="Select backend"
        onPress={onSetBackend}
        variant={ButtonVariant.contained}
      />

      <Title text="Leading account" />
      <Text t11>{leadingAccount}</Text>
      <Spacer height={8} />
      <Button
        title="Select leading account"
        onPress={onSetLeadingAccount}
        variant={ButtonVariant.contained}
      />

      <Spacer height={8} />
      <Title text="Raw Sign Request" />
      <Input
        placeholder="{ method: 'eth_sendTransactrion', params: [...] }"
        value={rawSignData}
        error={!isValidRawSignData}
        onChangeText={data => {
          setRawSignData(data);
          try {
            setSignData(JSON.parse(data));
            setValidRawSignData(true);
          } catch (e) {
            setValidRawSignData(false);
          }
        }}
      />
      <Spacer height={8} />
      <Button
        title="sign request"
        disabled={!isValidRawSignData}
        onPress={() => {
          awaitForJsonRpcSign({
            metadata: HAQQ_METADATA,
            request: signData!,
          });
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Title text="WalletConnect" />
      <Input
        placeholder="wc:"
        value={wc}
        onChangeText={v => {
          setWc(v);
        }}
      />
      <Spacer height={8} />
      <Button
        title="wallet connect"
        disabled={!wc}
        onPress={onPressWc}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Title text="Deeplink" />
      <Input
        placeholder="wc:, haqq:, ethereum:"
        value={deeplink}
        onChangeText={setDeeplink}
      />
      <Spacer height={8} />
      <Button
        title="call onDeepLink"
        disabled={!deeplink}
        onPress={onPressDeepLink}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Title text="Camera" />
      <Input
        placeholder="regexp pattern"
        value={regexp}
        onChangeText={setRegexp}
      />
      <Spacer height={8} />
      <Button
        title="QR scanner"
        onPress={async () => {
          try {
            const result = await awaitForScanQr({pattern: regexp});
            Alert.alert('result', JSON.stringify(result, null, 2));
          } catch (err) {
            Alert.alert('error', JSON.stringify(err, null, 2));
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Title text="Browser" />
      <Input
        placeholder="https://shell.haqq.network"
        value={browserUrl}
        onChangeText={setBrowserUrl}
      />
      <Spacer height={8} />
      <Button
        title="Open web3 browser"
        onPress={onPressOpenWeb3Browser}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Open in app browser"
        onPress={onPressOpenInAppBrowser}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="load test bookmarks for browser"
        onPress={() => {
          TEST_URLS.forEach(link => {
            if (!Web3BrowserBookmark.getByUrl(link?.url || '')) {
              Web3BrowserBookmark.create(link);
            }
          });
          toastMessage('bookmarks loaded');
        }}
        variant={ButtonVariant.contained}
      />
      <Title text="Modals" />
      <Button
        title="Open all modals"
        onPress={async () => {
          const testModals = getTestModals();
          Object.keys(testModals).forEach(modalName => {
            // @ts-ignore
            showModal(modalName, testModals[modalName]);
          });
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Show modal"
        onPress={async () => {
          const testModals = getTestModals();
          const modalsKeys = Object.keys(testModals);
          showActionSheetWithOptions({options: modalsKeys}, index => {
            if (typeof index === 'number') {
              const name = modalsKeys[index];
              if (name === ModalType.loading) {
                setTimeout(() => {
                  hideModal(ModalType.loading);
                }, 5000);
              }
              // @ts-ignore
              showModal(name, testModals[name]);
            }
          });
        }}
        variant={ButtonVariant.contained}
      />
      <Title text="Contracts" />
      <Button
        title="call contract"
        onPress={() => onCallContract()}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="mint contract"
        onPress={() => onMintContract()}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="check contract"
        onPress={() => onCheckContract()}
        variant={ButtonVariant.contained}
      />

      <Title text="Services" />
      <Button
        title="Create test banner"
        onPress={async () => {
          vibrate(HapticEffects.impactLight);
          await Banner.create(generateMockBanner());
          toastMessage('banner created');
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="clear banners"
        onPress={onClearBanners}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="clear referral"
        onPress={onClearReferrals}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="reset uid"
        onPress={onResetUid}
        variant={ButtonVariant.contained}
      />

      <Title text="Captcha" />
      <Button
        title="Show hcaptcha captcha"
        onPress={async () => {
          try {
            const result = await awaitForCaptcha({
              variant: CaptchaType.hcaptcha,
            });
            Alert.alert('result', JSON.stringify(result, null, 2));
          } catch (err) {
            // @ts-ignore
            Alert.alert('Error', JSON.stringify(err));
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Show oauth captcha"
        onPress={async () => {
          try {
            const result = await awaitForCaptcha({
              variant: CaptchaType.ocaptcha,
            });
            Alert.alert('result', JSON.stringify(result, null, 2));
            Clipboard.setString(result.token);
          } catch (err) {
            // @ts-ignore
            Alert.alert('Error', JSON.stringify(err));
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Show puzzle captcha"
        onPress={async () => {
          try {
            const result = await awaitForCaptcha({variant: CaptchaType.slider});
            Alert.alert('result', JSON.stringify(result, null, 2));
          } catch (err) {
            // @ts-ignore
            Alert.alert('Error', JSON.stringify(err));
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Cloudflare Turnstile"
        onPress={async () => {
          try {
            const result = await awaitForCaptcha({
              variant: CaptchaType.turnstile,
            });
            Alert.alert('result', JSON.stringify(result, null, 2));
          } catch (err) {
            // @ts-ignore
            Alert.alert('Error', JSON.stringify(err));
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Google recaptcha v2"
        onPress={async () => {
          try {
            const result = await awaitForCaptcha({
              variant: CaptchaType.recaptcha2,
            });
            Alert.alert('result', JSON.stringify(result, null, 2));
          } catch (err) {
            // @ts-ignore
            Alert.alert('Error', JSON.stringify(err));
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Show random captcha"
        onPress={async () => {
          try {
            const {captcha, session} = await Airdrop.instance.captchaSession();
            if (!captcha) {
              throw new Error('Captcha not available');
            }
            const result = await awaitForCaptcha({
              variant: captcha,
            });
            Alert.alert(
              'result',
              JSON.stringify({captcha, session, result}, null, 2),
            );
          } catch (err) {
            // @ts-ignore
            Alert.alert('Error', JSON.stringify(err));
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Title text="Realm" />
      <Button
        title={`clear news cache [RSS: ${rssNewsCount} | OUR:${newsCount}]`}
        onPress={() => {
          VariablesDate.remove('lastSyncUpdates');
          VariablesDate.remove('lastSyncNews');
          VariablesBool.remove('isNewNews');
          VariablesBool.remove('isNewRssNews');
          RssNews.removeAll();
          News.removeAll();
          setRssNewsCount(0);
          setNewsCount(0);
        }}
        variant={ButtonVariant.contained}
      />
      <Title text="awaitFor... examples" />
      <Button
        title={'EX1: awaitForValue with strings'}
        onPress={async () => {
          const values = stringsToValues([
            'value 1',
            ['value 2', 'subtitle for value 2'],
            'value 3',
          ]);
          const res = await awaitForValue({
            title: I18N.totalValueAccount,
            values,
            initialIndex: 1,
          });
          Alert.alert('result', JSON.stringify(res, null, 2));
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title={'EX2: awaitForValue with mapped objects'}
        onPress={async () => {
          try {
            const wallets = Wallet.getAll().map(w => ({
              ...w,
              title: w.name,
              subtitle: w.address,
            }));
            const values = objectsToValues(wallets);
            const res = await awaitForValue({
              title: I18N.address,
              values,
            });
            Alert.alert('result', JSON.stringify(res, null, 2));
          } catch (err) {
            Alert.alert('Error', JSON.stringify(err, null, 2));
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title={'EX3: awaitForValue with objects'}
        onPress={async () => {
          try {
            const values = objectsToValues(Wallet.getAll(), {
              titleKey: 'name',
              subtitleKey: 'address',
            });
            const res = await awaitForValue({
              title: I18N.address,
              values,
              initialIndex: 0,
            });
            Alert.alert('result', JSON.stringify(res, null, 2));
          } catch (err) {
            Alert.alert('Error', JSON.stringify(err, null, 2));
          }
        }}
        variant={ButtonVariant.contained}
      />

      <Spacer minHeight={100} />
      <Button
        title="Turn off developer"
        error
        onPress={onTurnOffDeveloper}
        variant={ButtonVariant.third}
      />
      <Spacer height={20} />
    </ScrollView>
  );
});

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
