import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {useActionSheet} from '@expo/react-native-action-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import CookieManager from '@react-native-cookies/cookies';
import {observer} from 'mobx-react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  SwitchChangeEvent,
  View,
} from 'react-native';

import {Color} from '@app/colors';
import {SettingsButton} from '@app/components/home-settings/settings-button';
import {JsonViewer} from '@app/components/json-viewer';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  DataContent,
  First,
  Icon,
  IconButton,
  IconsName,
  Input,
  MenuNavigationButton,
  Spacer,
  Text,
} from '@app/components/ui';
import {WebViewEventsEnum} from '@app/components/web3-browser';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForWallet, createTheme, hideModal, showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {awaitForProvider} from '@app/helpers/await-for-provider';
import {awaitForScanQr} from '@app/helpers/await-for-scan-qr';
import {AppInfo, getAppInfo} from '@app/helpers/get-app-info';
import {LinkType, parseDeepLink} from '@app/helpers/parse-deep-link';
import {useLayoutAnimation} from '@app/hooks/use-layout-animation';
import {I18N} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {Language} from '@app/models/language';
import {Provider} from '@app/models/provider';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {Whitelist} from '@app/models/whitelist';
import {navigator} from '@app/navigator';
import {SettingsStackRoutes} from '@app/route-types';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {message as toastMessage} from '@app/services/toast';
import {getUserAgent} from '@app/services/version';
import {ModalType, PartialJsonRpcRequest} from '@app/types';
import {
  openInAppBrowser,
  openWeb3Browser,
  showUnrecognizedDataAttention,
} from '@app/utils';
import {
  DEVELOPER_MODE_DOCS,
  HAQQ_METADATA,
  TEST_URLS,
} from '@app/variables/common';

const Title = ({text = ''}) => (
  <>
    <Spacer height={10} />
    <Text t10 children={text} />
    <Spacer height={5} />
  </>
);

export const SHOW_NON_WHITELIST_TOKEN = 'SHOW_NON_WHITELIST_TOKEN';

export const SettingsDeveloperTools = observer(() => {
  const {showActionSheetWithOptions} = useActionSheet();
  const {animate} = useLayoutAnimation();
  const [wc, setWc] = useState('');
  const [rawSignData, setRawSignData] = useState('');
  const [signData, setSignData] = useState<PartialJsonRpcRequest>();
  const [isValidRawSignData, setValidRawSignData] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [convertAddress, setConvertAddress] = useState('');
  const [verifyAddress, setVerifyAddress] = useState('');
  const [appInfo, setAppInfo] = useState<AppInfo | null>();
  const [isAppInfoHidden, setAppInfoHidden] = useState(true);

  const [showNonWhitlistedTokens, setShowNonWhitlistedTokens] = useState(
    VariablesBool.get(SHOW_NON_WHITELIST_TOKEN),
  );

  const onToggleShowNonWhitlistedTokens = useCallback(
    async ({nativeEvent: {value}}: SwitchChangeEvent) => {
      setShowNonWhitlistedTokens(value);
      VariablesBool.set(SHOW_NON_WHITELIST_TOKEN, value);
    },
    [],
  );

  const isValidConvertAddress = useMemo(
    () => AddressUtils.isValidAddress(convertAddress),
    [convertAddress],
  );

  const isValidVerifyAddress = useMemo(
    () => AddressUtils.isValidAddress(verifyAddress),
    [verifyAddress],
  );

  const onTurnOffDeveloper = useCallback(() => {
    AppStore.isTesterModeEnabled = false;
    navigator.goBack();
  }, []);

  const handleShowJsonViewer = useCallback(() => {
    animate();
    setAppInfoHidden(false);
  }, [animate]);

  const handleHideJsonViewer = useCallback(() => {
    animate();
    setAppInfoHidden(true);
  }, [animate]);

  const onPressWc = () => {
    app.emit(Events.onWalletConnectUri, wc);
  };

  const onPressOpenInAppBrowser = () => {
    openInAppBrowser(browserUrl);
  };

  const onPressOpenWeb3Browser = () => {
    openWeb3Browser(browserUrl);
  };

  const clearHistory = async () => {
    await Web3BrowserSearchHistory.removeAll();
    VariablesBool.set(WebViewEventsEnum.CLEAR_HISTORY, true);
    toastMessage('History cleared');
  };

  const deleteAllBookmarks = async () => {
    await Web3BrowserBookmark.removeAll();
    toastMessage('Bookmarks cleared');
  };

  const clearCache = async () => {
    clearHistory();
    VariablesBool.set(WebViewEventsEnum.CLEAR_CACHE, true);
    await Web3BrowserSession.removeAll();
    toastMessage('Cache cleared');
  };

  const clearCookie = async () => {
    VariablesBool.set(WebViewEventsEnum.CLEAR_CACHE, true);
    await Web3BrowserSession.removeAll();
    await CookieManager.clearAll(true);
    toastMessage('Cookie cleared');
  };

  const [watchOnlyAddress, setWatchOnlyAddress] = useState('');
  const watchOnlyAddressError = useMemo(() => {
    if (!watchOnlyAddress) {
      return undefined;
    }

    if (!AddressUtils.isValidAddress(watchOnlyAddress)) {
      return 'Invalid address';
    }

    if (Wallet.getById(watchOnlyAddress)) {
      return 'Wallet already exists';
    }

    return undefined;
  }, [watchOnlyAddress]);

  const onPressAddWatchOnlyWallet = async () => {
    try {
      await Wallet.createWatchOnly(watchOnlyAddress);
      showModal(ModalType.info, {
        title: 'Wallet added',
        description: `addresses:
EVM:\n${AddressUtils.toEth(watchOnlyAddress)}
HAQQ:\n${AddressUtils.toHaqq(watchOnlyAddress)}
TRON:\n${AddressUtils.toTron(watchOnlyAddress)}`,
      });
      vibrate(HapticEffects.success);
      setWatchOnlyAddress('');
    } catch (err) {
      vibrate(HapticEffects.error);
      showModal(ModalType.error, {
        title: 'Error while adding wallet',
        // @ts-ignore
        description: err.message,
      });
    }
  };

  const onPressClear = useCallback(() => {
    setWatchOnlyAddress('');
  }, [setWatchOnlyAddress]);

  const onPressPaste = useCallback(async () => {
    vibrate(HapticEffects.impactLight);
    const pasteString = await Clipboard.getString();
    setWatchOnlyAddress(pasteString);
  }, [setWatchOnlyAddress]);

  const onPressQR = useCallback(async () => {
    const data = await awaitForScanQr();
    const {type, params} = parseDeepLink(data);

    switch (type) {
      case LinkType.Haqq:
      case LinkType.Address:
      case LinkType.Etherium:
        setWatchOnlyAddress(params.address ?? '');
        break;
      default:
        showUnrecognizedDataAttention();
        break;
    }
  }, [setWatchOnlyAddress]);

  useEffect(() => {
    getAppInfo().then(setAppInfo);
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.jsonViewerContainer}>
        <First>
          {isAppInfoHidden && (
            <Button
              size={ButtonSize.small}
              title={'Show application info'}
              onPress={handleShowJsonViewer}
              onLongPress={() => {
                vibrate(HapticEffects.success);
                Clipboard.setString(JSON.stringify(appInfo, null, 2));
                toastMessage('Copied to clipboard');
              }}
            />
          )}

          <>
            <Button
              size={ButtonSize.small}
              title={'Hide application info'}
              onPress={handleHideJsonViewer}
            />
            <View style={styles.separator} />
            <ScrollView
              horizontal
              style={styles.json}
              showsHorizontalScrollIndicator={false}>
              <JsonViewer
                autoexpand={false}
                style={styles.json}
                data={appInfo}
              />
            </ScrollView>
          </>
        </First>
      </View>
      <Title text="User agent" />
      <Text
        t11
        onPress={() => {
          Clipboard.setString(getUserAgent());
          toastMessage('Copied to clipboard');
        }}>
        {getUserAgent()}
      </Text>
      <Spacer height={8} />

      <SettingsButton
        rightTitle={Language.current.toUpperCase()}
        next={SettingsStackRoutes.SettingsLanguage}
        icon={IconsName.language}
        title={I18N.homeSettingsLanguage}
      />
      <Spacer height={8} />
      <Title text="Watch only wallet" />
      <Input
        value={watchOnlyAddress}
        onChangeText={setWatchOnlyAddress}
        error={!!watchOnlyAddressError}
        label={watchOnlyAddressError}
        placeholder="haqq... | 0x... | T..."
        rightAction={
          <First>
            {watchOnlyAddress === '' && (
              <View style={styles.inputButtonContainer}>
                <IconButton onPress={onPressPaste}>
                  <Icon
                    i24
                    name={IconsName.paste}
                    color={Color.graphicGreen1}
                  />
                </IconButton>
                <Spacer width={12} />
                <IconButton onPress={onPressQR}>
                  <Icon
                    i24
                    name={IconsName.qr_scanner}
                    color={Color.graphicGreen1}
                  />
                </IconButton>
              </View>
            )}
            <IconButton onPress={onPressClear}>
              <Icon
                i24
                name={IconsName.close_circle}
                color={Color.graphicBase2}
              />
            </IconButton>
          </First>
        }
      />
      <Spacer height={8} />
      <Button
        title="Add wallet"
        disabled={!!watchOnlyAddressError || !watchOnlyAddress}
        variant={ButtonVariant.contained}
        onPress={onPressAddWatchOnlyWallet}
      />
      <Spacer height={8} />
      <Title text="Bench32/hex converter" />
      <Input
        placeholder="haqq... or 0x..."
        value={convertAddress}
        error={!isValidConvertAddress}
        onChangeText={setConvertAddress}
      />
      <Spacer height={8} />
      <Button
        title="convert"
        disabled={!isValidConvertAddress}
        onPress={() => {
          try {
            let converted = '';
            if (AddressUtils.isHaqqAddress(convertAddress)) {
              converted = AddressUtils.toEth(convertAddress);
            }
            if (AddressUtils.isEthAddress(convertAddress)) {
              converted = AddressUtils.toHaqq(convertAddress);
            }
            if (converted) {
              setConvertAddress(converted);
              Clipboard.setString(converted);
              toastMessage('Copied to clipboard');
            }
          } catch (err) {
            Alert.alert('error', JSON.stringify(err, null, 2));
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Title text="Contracts" />
      <MenuNavigationButton hideArrow onPress={() => {}}>
        <DataContent
          style={styles.dataContent}
          title={'Show non white-listed tokens'}
          subtitle={
            'Enable to display tokens that are not included in the Haqq Network white list. These tokens may be unsafe, and their appearance in the UI is highlighted in yellow to indicate potential risk.'
          }
        />
        <Spacer width={24} />
        <Switch
          value={showNonWhitlistedTokens}
          onChange={onToggleShowNonWhitlistedTokens}
        />
      </MenuNavigationButton>
      <Spacer height={8} />
      <Input
        placeholder="haqq... or 0x..."
        value={verifyAddress}
        error={!isValidConvertAddress}
        onChangeText={setVerifyAddress}
      />
      <Spacer height={8} />
      <Button
        title="verify contract"
        disabled={!isValidVerifyAddress}
        onPress={async () => {
          try {
            showModal('loading');
            const providerId = await awaitForProvider({
              disableAllNetworksOption: true,
              title: I18N.networks,
            });
            const provider = Provider.getById(providerId);
            const result = await Whitelist.verifyAddress(
              verifyAddress,
              provider!,
              true,
            );

            if (result) {
              Alert.alert('', JSON.stringify(result, null, 2), [
                {
                  text: 'Close',
                },
                {
                  text: 'Copy',
                  onPress: () => Clipboard.setString(JSON.stringify(result)),
                },
              ]);
            } else {
              Alert.alert('', 'address info not found');
            }
          } catch (err) {
            Alert.alert('error', JSON.stringify(err, null, 2));
          } finally {
            hideModal('loading');
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Title text="Raw Sign Request" />
      <Input
        placeholder="{ method: 'eth_sendTransactrion', params: [...] }"
        value={rawSignData}
        error={!!rawSignData && !isValidRawSignData}
        multiline
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
        onPress={async () => {
          try {
            const address = await awaitForWallet({
              title: I18N.selectAccount,
              wallets: Wallet.getAllVisible(),
            });
            const providerId = await awaitForProvider({
              disableAllNetworksOption: true,
              title: I18N.networks,
            });
            const result = await awaitForJsonRpcSign({
              metadata: HAQQ_METADATA,
              request: signData!,
              selectedAccount: address,
              chainId: Provider.getById(providerId)?.ethChainId,
            });
            Alert.alert('Result', result, [
              {text: 'Close'},
              {text: 'Copy', onPress: () => Clipboard.setString(result)},
            ]);
          } catch (err) {
            Alert.alert('error', JSON.stringify(err, null, 2));
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Paste"
        onPress={async () => {
          const data = await Clipboard.getString();
          setRawSignData(data);
          try {
            setSignData(JSON.parse(data));
            setValidRawSignData(true);
          } catch (e) {
            setValidRawSignData(false);
          }
        }}
        variant={ButtonVariant.second}
      />
      <Spacer height={8} />
      <Button
        title="Transaction snippet"
        onPress={() => {
          showActionSheetWithOptions(
            {
              options: [
                'Cancel',
                'eth_sendTransaction',
                'eth_signTransaction',
                'personal_sign',
                'eth_signTypedData_v4',
                'Sign in with Ethereum',
              ],
              cancelButtonIndex: 0,
              destructiveButtonIndex: 0,
              title: 'Choose action',
            },
            index => {
              let tx = {} as PartialJsonRpcRequest;
              //eth_sendTransaction and eth_signTransaction
              if (index === 1 || index === 2) {
                tx = {
                  method:
                    index === 1 ? 'eth_sendTransaction' : 'eth_signTransaction',
                  params: [
                    {
                      value: '1',
                      to: '0x415b829d862121f25fcdfdfadf7a705e45249dbc',
                    },
                  ],
                };
              }
              // personal_sign
              if (index === 3) {
                tx = {
                  method: 'personal_sign',
                  params: [
                    '0x415b829d862121f25fcdfdfadf7a705e45249dbc',
                    'Hello HAQQ Wallet!',
                  ],
                };
              }

              // eth_signTypedData_v4
              if (index === 4) {
                tx = {
                  method: 'eth_signTypedData_v4',
                  params: [
                    '0x1bb71b571a16eed293d931d245f43d2a1d341759',
                    {
                      types: {
                        EIP712Domain: [
                          {
                            name: 'name',
                            type: 'string',
                          },
                          {
                            name: 'version',
                            type: 'string',
                          },
                          {
                            name: 'chainId',
                            type: 'uint256',
                          },
                          {
                            name: 'verifyingContract',
                            type: 'string',
                          },
                          {
                            name: 'salt',
                            type: 'string',
                          },
                        ],
                        Tx: [
                          {
                            name: 'account_number',
                            type: 'string',
                          },
                          {
                            name: 'chain_id',
                            type: 'string',
                          },
                          {
                            name: 'fee',
                            type: 'Fee',
                          },
                          {
                            name: 'memo',
                            type: 'string',
                          },
                          {
                            name: 'msgs',
                            type: 'Msg[]',
                          },
                          {
                            name: 'sequence',
                            type: 'string',
                          },
                        ],
                        Fee: [
                          {
                            name: 'feePayer',
                            type: 'string',
                          },
                          {
                            name: 'amount',
                            type: 'Coin[]',
                          },
                          {
                            name: 'gas',
                            type: 'string',
                          },
                        ],
                        Coin: [
                          {
                            name: 'denom',
                            type: 'string',
                          },
                          {
                            name: 'amount',
                            type: 'string',
                          },
                        ],
                        Msg: [
                          {
                            name: 'type',
                            type: 'string',
                          },
                          {
                            name: 'value',
                            type: 'MsgValue',
                          },
                        ],
                        MsgValue: [
                          {
                            name: 'delegator_address',
                            type: 'string',
                          },
                          {
                            name: 'validator_address',
                            type: 'string',
                          },
                          {
                            name: 'amount',
                            type: 'TypeAmount',
                          },
                        ],
                        TypeAmount: [
                          {
                            name: 'denom',
                            type: 'string',
                          },
                          {
                            name: 'amount',
                            type: 'string',
                          },
                        ],
                      },
                      primaryType: 'Tx',
                      domain: {
                        name: 'Cosmos Web3',
                        version: '1.0.0',
                        chainId: 11235,
                        verifyingContract: 'cosmos',
                        salt: '0',
                      },
                      message: {
                        account_number: '3239277',
                        chain_id: 'haqq_11235-1',
                        fee: {
                          amount: [
                            {
                              amount: '181336045000000000',
                              denom: 'aISLM',
                            },
                          ],
                          gas: '6594038',
                          feePayer:
                            'haqq1rwm3k4c6zmhd9y7ex8fytapa9gwng96eapx3ek',
                        },
                        memo: '',
                        msgs: [
                          {
                            type: 'cosmos-sdk/MsgDelegate',
                            value: {
                              amount: {
                                amount: '1000000000000000000',
                                denom: 'aISLM',
                              },
                              delegator_address:
                                'haqq1rwm3k4c6zmhd9y7ex8fytapa9gwng96eapx3ek',
                              validator_address:
                                'haqqvaloper16hy887wxzjmmkkfrdxzgz9dlv6mfru56q539cw',
                            },
                          },
                        ],
                        sequence: '1',
                      },
                    },
                  ],
                };
              }

              // Sign in with Ethereum
              if (index === 5) {
                tx = {
                  method: 'personal_sign',
                  params: [
                    '0x415b829d862121f25fcdfdfadf7a705e45249dbc',
                    `HAQQ Wallet wants you to sign in with your Ethereum account:
0x415b829d862121f25fcdfdfadf7a705e45249dbc

This is a test statement.

URI: https://test.test/login
Version: 1
Chain ID: 11235
Nonce: 1234567890
Issued At: 2024-02-20T12:00:00.000Z`,
                  ],
                };
              }

              setRawSignData(JSON.stringify(tx, null, 2));
              setSignData(tx);
              setValidRawSignData(true);
            },
          );
        }}
        variant={ButtonVariant.second}
      />
      <Spacer height={8} />
      <Button
        title="Clear"
        disabled={!rawSignData}
        onPress={() => setRawSignData('')}
        variant={ButtonVariant.warning}
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
      <Spacer height={8} />
      <Button
        title="Clear cookie"
        onPress={clearCookie}
        error
        variant={ButtonVariant.second}
      />
      <Spacer height={8} />
      <Button
        title="Clear history"
        onPress={clearHistory}
        error
        variant={ButtonVariant.second}
      />
      <Spacer height={8} />
      <Button
        title="Delete all bookmarks"
        onPress={deleteAllBookmarks}
        error
        variant={ButtonVariant.second}
      />
      <Spacer height={8} />
      <Button
        title="Reset all browser cache"
        onPress={clearCache}
        error
        variant={ButtonVariant.second}
      />
      <Spacer height={8} />
      <Title text="Others" />
      <Button
        title="Developer mode docs"
        onPress={() => openWeb3Browser(DEVELOPER_MODE_DOCS)}
        variant={ButtonVariant.second}
      />
      <Spacer height={8} />
      <Button
        title="Turn off developer mode"
        error
        onPress={onTurnOffDeveloper}
        variant={ButtonVariant.second}
      />
      <Spacer height={20} />
    </ScrollView>
  );
});

const styles = createTheme({
  inputButtonContainer: {
    flexDirection: 'row',
  },
  dataContent: {
    flex: 4,
  },
  container: {
    marginHorizontal: 20,
  },
  json: {
    width: '100%',
  },
  jsonViewerContainer: {
    width: '100%',
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Color.graphicSecond1,
    paddingHorizontal: 20,
  },
  separator: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: Color.graphicSecond2,
  },
});
