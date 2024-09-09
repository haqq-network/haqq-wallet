import React, {useCallback, useEffect, useMemo, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import CookieManager from '@react-native-cookies/cookies';
import {observer} from 'mobx-react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {SettingsButton} from '@app/components/home-settings/settings-button';
import {JsonViewer} from '@app/components/json-viewer';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  First,
  IconsName,
  Input,
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
import {AppInfo, getAppInfo} from '@app/helpers/get-app-info';
import {Whitelist} from '@app/helpers/whitelist';
import {useLayoutAnimation} from '@app/hooks/use-layout-animation';
import {I18N} from '@app/i18n';
import {Language} from '@app/models/language';
import {Provider} from '@app/models/provider';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {navigator} from '@app/navigator';
import {SettingsStackRoutes} from '@app/route-types';
import {message as toastMessage} from '@app/services/toast';
import {getUserAgent} from '@app/services/version';
import {PartialJsonRpcRequest} from '@app/types';
import {openInAppBrowser, openWeb3Browser} from '@app/utils';
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

export const SettingsDeveloperTools = observer(() => {
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

  const isValidConvertAddress = useMemo(
    () => AddressUtils.isValidAddress(convertAddress),
    [convertAddress],
  );

  const isValidVerifyAddress = useMemo(
    () => AddressUtils.isValidAddress(verifyAddress),
    [verifyAddress],
  );

  const onTurnOffDeveloper = useCallback(() => {
    app.isTesterMode = false;
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
      <Title text="Contract info" />
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
              providers: Provider.getAll(),
              initialProviderId: '',
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
            const providers = Provider.getAll();
            const initialProviderId = Provider.selectedProviderId;
            const providerId = await awaitForProvider({
              providers,
              initialProviderId: initialProviderId!,
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
        title="Clear"
        disabled={!rawSignData}
        onPress={() => setRawSignData('')}
        variant={ButtonVariant.second}
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
