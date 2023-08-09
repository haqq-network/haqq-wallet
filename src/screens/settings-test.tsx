import React, {useCallback, useState} from 'react';

import {HAQQ_BACKEND, HAQQ_BACKEND_DEV} from '@env';
import {useActionSheet} from '@expo/react-native-action-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import messaging from '@react-native-firebase/messaging';
import BN from 'bn.js';
import {utils} from 'ethers';
import {Alert, ScrollView} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import shajs from 'sha.js';

import {CaptchaType} from '@app/components/captcha';
import {Button, ButtonVariant, Input, Spacer, Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {
  awaitForWallet,
  createTheme,
  getProviderInstanceForWallet,
  hideModal,
  showModal,
} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {News} from '@app/models/news';
import {Provider} from '@app/models/provider';
import {Refferal} from '@app/models/refferal';
import {RssNews} from '@app/models/rss-news';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {EthNetwork} from '@app/services';
import {message as toastMessage} from '@app/services/toast';
import {getUserAgent} from '@app/services/version';
import {Link, Modals} from '@app/types';
import {makeID, openInAppBrowser, openWeb3Browser} from '@app/utils';
import {WINDOW_HEIGHT} from '@app/variables/common';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  Logger.log('setBackgroundMessageHandler', remoteMessage);
});

messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      Logger.log('getInitialNotification', remoteMessage);
    }
  });

const getTestModals = (): Partial<Modals> => {
  const wallets = Wallet.getAllVisible();
  const firstWalletAddress = wallets[0].address;
  const providers = Provider.getAll();
  const firstProviderId = providers[0].id;
  const modals: Partial<Modals> = {
    // splash: undefined,
    // pin: undefined,
    noInternet: {showClose: true},
    loading: {
      text: 'a few moment later...',
    },
    error: {
      onClose: () => {
        hideModal('loading');
      },
      title: 'Something went wrong',
      description: 'Please try again later',
      close: 'OK',
    },
    qr: {
      onClose: () => {},
      qrWithoutFrom: false,
    },
    bluetoothPoweredOff: {
      onClose: () => {},
    },
    bluetoothUnauthorized: {
      onClose: () => {},
    },
    domainBlocked: {
      onClose: () => {},
      domain: 'example.com',
    },
    ledgerNoApp: {
      onClose: () => {},
      onRetry: Promise.resolve,
    },
    ledgerAttention: {
      onClose: () => {},
    },
    ledgerLocked: {
      onClose: () => {},
    },
    errorAccountAdded: {
      onClose: () => {},
    },
    errorCreateAccount: {
      onClose: () => {},
    },
    claimOnMainnet: {
      onClose: () => {},
      onChange: () => {},
      network: 'MainMet',
    },
    transactionError: {
      onClose: () => {},
      message: 'Something went wrong',
    },
    locationUnauthorized: {
      onClose: () => {},
    },
    captcha: {
      onClose: () => {},
      variant: CaptchaType.slider,
    },
  };

  if (wallets.length) {
    modals.walletsBottomSheet = {
      onClose: () => {},
      wallets,
      closeDistance: WINDOW_HEIGHT / 6,
      title: I18N.welcomeTitle,
      autoSelectWallet: false,
      eventSuffix: '-test',
    };
  }

  if (firstWalletAddress) {
    modals.cardDetailsQr = {
      address: firstWalletAddress,
      onClose: () => {},
    };
  }

  if (firstProviderId) {
    modals.providersBottomSheet = {
      onClose: () => {},
      title: I18N.welcomeTitle,
      providers,
      initialProviderId: firstProviderId,
      closeDistance: WINDOW_HEIGHT / 6,
      eventSuffix: '-test',
    };
  }

  return modals;
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
const TEST_URLS: Partial<Link>[] = [
  {
    title: 'HAQQ Dashboard',
    url: 'https://shell.haqq.network',
    icon: 'https://shell.haqq.network/assets/favicon.svg',
  },
  {
    title: 'HAQQ Vesting',
    url: 'https://vesting.haqq.network',
    icon: 'https://vesting.haqq.network/assets/favicon.svg',
  },
  {title: 'HAQQ Faucet', url: 'https://testedge2.haqq.network'},
  {title: 'app uniswap', url: 'https://app.uniswap.org'},
  {title: 'safe', url: 'https://safe.testedge2.haqq.network'},
  {title: 'new safe', url: 'https://new.safe.testedge2.haqq.network'},
  {
    title: 'metamask test dapp',
    url: 'https://metamask.github.io/test-dapp/',
  },
  {
    title: 'ChainList app',
    url: 'https://chainlist.org/',
  },
];

async function callContract(to: string, func: string, ...params: any[]) {
  const iface = new utils.Interface(abi);
  Logger.log('params', params);
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

export const SettingsTestScreen = () => {
  const {showActionSheetWithOptions} = useActionSheet();
  const [wc, setWc] = useState('');
  const [browserUrl, setBrowserUrl] = useState('');
  const [contract] = useState('0xB641EcDDdE1C0A9cC83B70B15eC9789c1365B3d2');
  const navigation = useTypedNavigation();
  const [newsCount, setNewsCount] = useState(News.getAll().length);
  const [rssNewsCount, setRssNewsCount] = useState(RssNews.getAll().length);
  const [backend, setBackend] = useState(app.backend);

  const onTurnOffDeveloper = useCallback(() => {
    app.isDeveloper = false;
    navigation.goBack();
  }, [navigation]);

  const onPressWc = () => {
    app.emit(Events.onWalletConnectUri, wc);
  };

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
    Logger.log('resp', resp);
    const r = iface.decodeFunctionResult('tokensOfOwner', resp);

    Logger.log(JSON.stringify(r));
  };

  const onMintContract = async () => {
    const iface = new utils.Interface(abi);
    const data = iface.encodeFunctionData('mintNFTs', [1]);

    Logger.log('data', data);

    const walletId = await awaitForWallet({
      wallets: Wallet.getAll().snapshot(),
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
      new BN(100000000000000),
      data,
      250000,
    );

    const signedTx = await transport.signTransaction(wallet.path!, unsignedTx);

    Logger.log('signedTx', signedTx);

    const resp = await EthNetwork.sendTransaction(signedTx);

    Logger.log('resp', resp);
    const r = iface.decodeFunctionData('mintNFTs', resp.data);

    Logger.log(JSON.stringify(r));
  };

  const onCheckContract = useCallback(async () => {
    const code = await EthNetwork.getCode(contract);
    Logger.log('code', code);

    const interfaces = await callContract(
      contract,
      'supportsInterface',
      0x80ac58cd,
    );

    Logger.log('interfaces', ...interfaces);

    const name = await callContract(contract, 'name');
    Logger.log('name', ...name);

    const symbol = await callContract(contract, 'symbol');
    Logger.log('symbol', ...symbol);
  }, [contract]);

  const onResetUid = useCallback(async () => {
    const uid = shajs('sha256').update(makeID(10)).digest('hex');
    await EncryptedStorage.setItem('uid', uid);
  }, []);

  const onClearBanners = useCallback(() => {
    Banner.removeAll();
  }, []);

  const onClearReferrals = useCallback(() => {
    Refferal.removeAll();
  }, []);

  return (
    <ScrollView style={styles.container}>
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
        onPress={async () => {
          const modalsKeys = ['production', 'development'];
          showActionSheetWithOptions({options: modalsKeys}, index => {
            if (typeof index === 'number') {
              app.backend = index === 1 ? HAQQ_BACKEND_DEV : HAQQ_BACKEND;
              setBackend(app.backend);
            }
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
              if (name === 'loading') {
                setTimeout(() => {
                  hideModal('loading');
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
            const result = await awaitForCaptcha({type: CaptchaType.hcaptcha});
            Alert.alert('result', result);
          } catch (err) {
            // @ts-ignore
            Alert.alert('Error', err?.message);
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Show puzzle captcha"
        onPress={async () => {
          try {
            const result = await awaitForCaptcha({type: CaptchaType.slider});
            Alert.alert('result', result);
          } catch (err) {
            // @ts-ignore
            Alert.alert('Error', err?.message);
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
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
