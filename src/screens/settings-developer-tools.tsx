import React, {useCallback, useMemo, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {utils} from 'ethers';
import {observer} from 'mobx-react';
import {Alert, ScrollView} from 'react-native';

import {Button, ButtonVariant, Input, Spacer, Text} from '@app/components/ui';
import {WebViewEventsEnum} from '@app/components/web3-browser';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme} from '@app/helpers';
import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {VariablesBool} from '@app/models/variables-bool';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {navigator} from '@app/navigator';
import {Cosmos} from '@app/services/cosmos';
import {message as toastMessage} from '@app/services/toast';
import {getUserAgent} from '@app/services/version';
import {PartialJsonRpcRequest} from '@app/types';
import {isHaqqAddress, openInAppBrowser, openWeb3Browser} from '@app/utils';
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
  const [wc, setWc] = useState('');
  const [rawSignData, setRawSignData] = useState('');
  const [signData, setSignData] = useState<PartialJsonRpcRequest>();
  const [isValidRawSignData, setValidRawSignData] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [convertAddress, setConvertAddress] = useState('');

  const isValidConvertAddress = useMemo(
    () => isHaqqAddress(convertAddress) || utils.isAddress(convertAddress),
    [convertAddress],
  );

  const onTurnOffDeveloper = useCallback(() => {
    app.isTesterMode = false;
    navigator.goBack();
  }, []);

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
      <Title text="bench32/hex converter" />
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
            if (isHaqqAddress(convertAddress)) {
              converted = Cosmos.bech32ToAddress(convertAddress);
            }
            if (utils.isAddress(convertAddress)) {
              converted = Cosmos.addressToBech32(convertAddress);
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
        onPress={async () => {
          try {
            const result = await awaitForJsonRpcSign({
              metadata: HAQQ_METADATA,
              request: signData!,
              selectedAccount: getLeadingAccount()?.address,
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
    paddingHorizontal: 20,
  },
});
