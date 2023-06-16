import React, {useCallback, useState} from 'react';

import messaging from '@react-native-firebase/messaging';
import BN from 'bn.js';
import {utils} from 'ethers';
import {Alert, ScrollView} from 'react-native';

import {Color} from '@app/colors';
import {CaptchaType} from '@app/components/captcha';
import {Button, ButtonVariant, Input, Spacer} from '@app/components/ui';
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
import {onUrlSubmit} from '@app/helpers/web3-browser-utils';
import {useTypedNavigation, useUser} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {Provider} from '@app/models/provider';
import {Refferal} from '@app/models/refferal';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {EthNetwork} from '@app/services';
import {message as toastMessage} from '@app/services/toast';
import {Link, Modals} from '@app/types';
import {WINDOW_HEIGHT} from '@app/variables/common';

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

const TEST_MODALS: Partial<Modals> = {
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
  walletsBottomSheet: {
    onClose: () => {},
    wallets: Wallet.getAllVisible(),
    closeDistance: WINDOW_HEIGHT / 6,
    title: I18N.welcomeTitle,
    autoSelectWallet: false,
    eventSuffix: '-test',
  },
  transactionError: {
    onClose: () => {},
    message: 'Something went wrong',
  },
  locationUnauthorized: {
    onClose: () => {},
  },
  providersBottomSheet: {
    onClose: () => {},
    title: I18N.welcomeTitle,
    providers: Provider.getProviders(),
    initialProviderId: Provider.getProviders()[0].id,
    closeDistance: WINDOW_HEIGHT / 6,
    eventSuffix: '-test',
  },
  captcha: {
    onClose: () => {},
    variant: CaptchaType.slider,
  },
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
    url: 'https://app.haqq.network',
    icon: 'https://app.haqq.network/assets/favicon.svg',
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
  console.log('params', params);
  const data = iface.encodeFunctionData(func, params);

  const rawTx = {
    to,
    data,
  };

  const resp = await EthNetwork.network.call(rawTx);
  return iface.decodeFunctionResult(func, resp);
}

export const SettingsTestScreen = () => {
  const [wc, setWc] = useState('');
  const [browserUrl, setBrowserUrl] = useState('');
  const [contract] = useState('0xB641EcDDdE1C0A9cC83B70B15eC9789c1365B3d2');
  const navigation = useTypedNavigation();
  const user = useUser();

  const onTurnOffDeveloper = useCallback(() => {
    user.isDeveloper = false;
    navigation.goBack();
  }, [user, navigation]);

  const onPressWc = () => {
    app.emit(Events.onWalletConnectUri, wc);
  };

  const onPressOpenBrowser = () => {
    navigation.navigate('homeBrowser', {
      screen: 'web3browser',
      params: {url: onUrlSubmit(browserUrl)},
    });
  };

  const onCallContract = async () => {
    const iface = new utils.Interface(abi);
    const data = iface.encodeFunctionData('tokensOfOwner', [
      '0x6e03A60fdf8954B4c10695292Baf5C4bdC34584B',
    ]);

    console.log('data', data);

    const rawTx = {
      to: contract,
      data: data,
    };

    const resp = await EthNetwork.network.call(rawTx);
    console.log('resp', resp);
    const r = iface.decodeFunctionResult('tokensOfOwner', resp);

    console.log(JSON.stringify(r));
  };

  const onMintContract = async () => {
    const iface = new utils.Interface(abi);
    const data = iface.encodeFunctionData('mintNFTs', [1]);

    console.log('data', data);

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

    console.log('signedTx', signedTx);

    const resp = await EthNetwork.network.sendTransaction(signedTx);

    console.log('resp', resp);
    const r = iface.decodeFunctionData('mintNFTs', resp.data);

    console.log(JSON.stringify(r));
  };

  const onCheckContract = useCallback(async () => {
    const code = await EthNetwork.network.getCode(contract);
    console.log('code', code);

    const interfaces = await callContract(
      contract,
      'supportsInterface',
      0x80ac58cd,
    );

    console.log('interfaces', ...interfaces);

    const name = await callContract(contract, 'name');
    console.log('name', ...name);

    const symbol = await callContract(contract, 'symbol');
    console.log('symbol', ...symbol);
  }, [contract]);

  const onCreateBanner = useCallback(() => {
    Banner.create({
      id: 'qwerty',
      title: 'Reward for creating the first account',
      description:
        'Join us in the spirit of Ramadan and claim your free ISLM coins.',
      type: 'claimCode',
      buttons: [
        {
          id: new Realm.BSON.UUID(),
          title: 'Claim reward',
          event: 'claimCode',
          params: {
            claim_code: 'qwerty',
          },
          color: '#01B26E',
          backgroundColor: '#EEF9F5',
        },
      ],
      backgroundColorFrom: '#1D69A4',
      backgroundColorTo: '#0C9FA5',
      backgroundImage:
        'https://storage.googleapis.com/mobile-static/reward-banner-1.png',
    });
  }, []);

  const onClearBanners = useCallback(() => {
    Banner.removeAll();
  }, []);

  const onClearReferrals = useCallback(() => {
    Refferal.removeAll();
  }, []);

  return (
    <ScrollView style={styles.container}>
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
      <Input
        placeholder="https://app.haqq.network"
        value={browserUrl}
        onChangeText={setBrowserUrl}
      />
      <Spacer height={5} />
      <Button
        title="Open web3 browser"
        onPress={onPressOpenBrowser}
        variant={ButtonVariant.contained}
      />
      <Spacer height={5} />
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
      <Spacer height={5} />
      <Button
        title="Show modal"
        onPress={() =>
          showModal('error', {
            title: getText(I18N.modalRewardErrorTitle),
            description: getText(I18N.modalRewardErrorDescription),
            close: getText(I18N.modalRewardErrorClose),
            icon: 'reward_error',
            color: Color.graphicSecond4,
          })
        }
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
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
      <Spacer height={8} />
      <Button
        title="create banner"
        onPress={onCreateBanner}
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
      <Spacer height={8} />
      <Button
        title="Open all modals"
        onPress={async () => {
          Object.keys(TEST_MODALS).forEach(modalName => {
            // @ts-ignore
            showModal(modalName, TEST_MODALS[modalName]);
          });
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
