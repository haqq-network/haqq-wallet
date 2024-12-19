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
import {
  startNetworkLogging,
  stopNetworkLogging,
} from 'react-native-network-logger';
import RNRestart from 'react-native-restart';

import {Color} from '@app/colors';
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
  TextVariant,
} from '@app/components/ui';
import {ShadowCard} from '@app/components/ui/shadow-card';
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
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {Whitelist} from '@app/models/whitelist';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {message as toastMessage} from '@app/services/toast';
import {getUserAgent} from '@app/services/version';
import {ModalType, PartialJsonRpcRequest} from '@app/types';
import {
  openInAppBrowser,
  openWeb3Browser,
  requestMockTxActionSheet,
  showUnrecognizedDataAttention,
} from '@app/utils';
import {
  DEVELOPER_MODE_DOCS,
  HAQQ_METADATA,
  SHOW_NON_WHITELIST_TOKEN,
  TEST_URLS,
} from '@app/variables/common';

const Title = ({text = ''}) => (
  <>
    <Text t8 children={text} />
    <Spacer height={5} />
  </>
);

export const SettingsDeveloperTools = observer(() => {
  const actionSheetProps = useActionSheet();
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
    stopNetworkLogging();
    RNRestart.restart();
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ShadowCard>
        <View style={styles.block}>
          <Title text="Debug info" />
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
          <Spacer height={8} />
          <Text variant={TextVariant.t10} children="User agent" />
          <Text
            t11
            onPress={() => {
              Clipboard.setString(getUserAgent());
              toastMessage('Copied to clipboard');
            }}>
            {getUserAgent()}
          </Text>
        </View>
      </ShadowCard>

      <ShadowCard>
        <View style={styles.block}>
          <Title text="Feature flags" />
          <MenuNavigationButton hideArrow onPress={() => {}}>
            <DataContent
              style={styles.dataContent}
              title={'Enable network logger'}
              subtitle={'Shake device to show network logs'}
            />
            <Spacer width={24} />
            <Switch
              value={AppStore.networkLoggerEnabled}
              onChange={({nativeEvent: {value}}) => {
                AppStore.networkLoggerEnabled = value;
                if (value) {
                  startNetworkLogging({
                    forceEnable: true,
                    ignoredPatterns: [/posthog\.com/, /google\.com/],
                    maxRequests: AppStore.networkLogsCacheSize,
                  });
                } else {
                  stopNetworkLogging();
                }
              }}
            />
          </MenuNavigationButton>

          <MenuNavigationButton hideArrow onPress={() => {}}>
            <DataContent
              style={styles.dataContent}
              title={'Include testnet\'s for "All Network"'}
              subtitle={
                '"All Networks" mode will be use testnet\'s chains if you activate this option'
              }
            />
            <Spacer width={24} />
            <Switch
              value={AppStore.testnetsEnabledForAllNetworks}
              onChange={({nativeEvent: {value}}) => {
                AppStore.testnetsEnabledForAllNetworks = value;
              }}
            />
          </MenuNavigationButton>
          <Spacer height={8} />
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
        </View>
      </ShadowCard>

      <ShadowCard>
        <View style={styles.block}>
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
        </View>
      </ShadowCard>

      <ShadowCard>
        <View style={styles.block}>
          <Title text="Bench32/hex converter" />
          <Input
            placeholder="haqq... or 0x..."
            value={convertAddress}
            error={!!convertAddress && !isValidConvertAddress}
            onChangeText={setConvertAddress}
            rightAction={
              <First>
                {convertAddress === '' && (
                  <View style={styles.inputButtonContainer}>
                    <IconButton
                      onPress={async () => {
                        const data = await Clipboard.getString();
                        setConvertAddress(data);
                      }}>
                      <Icon
                        i24
                        name={IconsName.paste}
                        color={Color.graphicGreen1}
                      />
                    </IconButton>
                  </View>
                )}
                <IconButton onPress={() => setConvertAddress('')}>
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
            title="Convert"
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
        </View>
      </ShadowCard>

      <ShadowCard>
        <View style={styles.block}>
          <Title text="Contract information" />
          <Input
            placeholder="haqq... or 0x..."
            value={verifyAddress}
            error={!!verifyAddress && !isValidConvertAddress}
            onChangeText={setVerifyAddress}
            rightAction={
              <First>
                {verifyAddress === '' && (
                  <View style={styles.inputButtonContainer}>
                    <IconButton
                      onPress={async () => {
                        const data = await Clipboard.getString();
                        setVerifyAddress(data);
                      }}>
                      <Icon
                        i24
                        name={IconsName.paste}
                        color={Color.graphicGreen1}
                      />
                    </IconButton>
                  </View>
                )}
                <IconButton onPress={() => setVerifyAddress('')}>
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
            title="Fetch contract info"
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
                      onPress: () =>
                        Clipboard.setString(JSON.stringify(result)),
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
        </View>
      </ShadowCard>

      <ShadowCard>
        <View style={styles.block}>
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
            rightAction={
              <First>
                {rawSignData === '' && (
                  <View style={styles.inputButtonContainer}>
                    <IconButton
                      onPress={async () => {
                        const data = await Clipboard.getString();
                        setRawSignData(data);
                        try {
                          setSignData(JSON.parse(data));
                          setValidRawSignData(true);
                        } catch (e) {
                          setValidRawSignData(false);
                        }
                      }}>
                      <Icon
                        i24
                        name={IconsName.paste}
                        color={Color.graphicGreen1}
                      />
                    </IconButton>
                  </View>
                )}
                <IconButton onPress={() => setRawSignData('')}>
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
            title="Sign request"
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
            title="Transaction snippet"
            onPress={async () => {
              const tx = await requestMockTxActionSheet(actionSheetProps);
              setRawSignData(JSON.stringify(tx, null, 2));
              setSignData(tx);
              setValidRawSignData(true);
            }}
            variant={ButtonVariant.second}
          />
        </View>
      </ShadowCard>

      <ShadowCard>
        <View style={styles.block}>
          <Title text="WalletConnect" />
          <Input
            placeholder="wc:"
            value={wc}
            onChangeText={v => {
              setWc(v);
            }}
            rightAction={
              <First>
                {wc === '' && (
                  <View style={styles.inputButtonContainer}>
                    <IconButton
                      onPress={async () => {
                        const data = await Clipboard.getString();
                        setWc(data);
                      }}>
                      <Icon
                        i24
                        name={IconsName.paste}
                        color={Color.graphicGreen1}
                      />
                    </IconButton>
                  </View>
                )}
                <IconButton onPress={() => setWc('')}>
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
            title="Connect"
            disabled={!wc}
            onPress={onPressWc}
            variant={ButtonVariant.contained}
          />
        </View>
      </ShadowCard>

      <ShadowCard>
        <View style={styles.block}>
          <Title text="Browser" />
          <Input
            placeholder="https://shell.haqq.network"
            value={browserUrl}
            onChangeText={setBrowserUrl}
            rightAction={
              <First>
                {browserUrl === '' && (
                  <View style={styles.inputButtonContainer}>
                    <IconButton
                      onPress={async () => {
                        const data = await Clipboard.getString();
                        setBrowserUrl(data);
                      }}>
                      <Icon
                        i24
                        name={IconsName.paste}
                        color={Color.graphicGreen1}
                      />
                    </IconButton>
                  </View>
                )}
                <IconButton onPress={() => setBrowserUrl('')}>
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
            variant={ButtonVariant.warning}
          />
          <Spacer height={8} />
          <Button
            title="Clear history"
            onPress={clearHistory}
            variant={ButtonVariant.warning}
          />
          <Spacer height={8} />
          <Button
            title="Reset browser cache"
            onPress={clearCache}
            variant={ButtonVariant.warning}
          />
          <Spacer height={8} />
          <Button
            title="Delete all bookmarks"
            onPress={deleteAllBookmarks}
            error
            variant={ButtonVariant.second}
          />
        </View>
      </ShadowCard>

      <ShadowCard>
        <View style={styles.block}>
          <Title text="Others" />
          <Button
            title="Developer mode docs"
            onPress={() => openWeb3Browser(DEVELOPER_MODE_DOCS)}
            variant={ButtonVariant.second}
          />
          <Spacer height={8} />
          <Button
            title="Clear balance cache"
            onPress={() => {
              Wallet.balances = {};
              Token.tokens = {};
              Wallet.lastBalanceUpdate = new Date(0);
              RNRestart.restart();
            }}
            variant={ButtonVariant.warning}
          />
          <Spacer height={8} />
          <Button
            title="Turn off developer mode"
            error
            onPress={onTurnOffDeveloper}
            variant={ButtonVariant.second}
          />
        </View>
      </ShadowCard>
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
    paddingHorizontal: 20,
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
  block: {
    paddingHorizontal: 10,
  },
});
