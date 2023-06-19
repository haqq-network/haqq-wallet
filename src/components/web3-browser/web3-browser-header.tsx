import React, {useCallback, useMemo} from 'react';

import {LayoutChangeEvent, TouchableOpacity, View} from 'react-native';
import Animated, {SlideInRight, SlideOutRight} from 'react-native-reanimated';
import {WebViewNavigation} from 'react-native-webview';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {Wallet} from '@app/models/wallet';

import {clearUrl} from '../../helpers/web3-browser-utils';
import {First, Icon, IconButton, IconsName, Spacer, Text} from '../ui';
import {WalletRow, WalletRowTypes} from '../wallet-row';

export interface Web3BrowserPressHeaderEvent {
  siteUrl: string;
  clearSiteUrl: string;
}

interface Web3BrowserHeaderProps {
  wallet: Wallet;
  webviewNavigationData: WebViewNavigation;
  siteUrl: string;
  popup?: boolean;

  onPressMore(): void;

  onPressHeaderWallet(accountId: string): void;

  onMoreIconLayout(event: LayoutChangeEvent): void;

  onPressGoBack(): void;

  onPressGoForward(): void;

  onPressClose(): void;

  onPressHeaderUrl(event: Web3BrowserPressHeaderEvent): void;
}

export const Web3BrowserHeader = ({
  wallet,
  webviewNavigationData,
  siteUrl,
  popup,
  onPressClose,
  onPressMore,
  onPressHeaderUrl,
  onMoreIconLayout,
  onPressGoBack,
  onPressGoForward,
  onPressHeaderWallet,
}: Web3BrowserHeaderProps) => {
  const clearSiteUrl = useMemo(() => clearUrl(siteUrl), [siteUrl]);

  const handleUrlPress = useCallback(() => {
    onPressHeaderUrl?.({
      siteUrl,
      clearSiteUrl,
    });
  }, [clearSiteUrl, onPressHeaderUrl, siteUrl]);

  const handlePressHeaderWallet = () => {
    onPressHeaderWallet?.(wallet?.accountId!);
  };

  return (
    <View style={styles.header}>
      <IconButton
        disabled={!webviewNavigationData?.canGoBack}
        onPress={onPressGoBack}>
        <Icon
          color={
            webviewNavigationData?.canGoBack
              ? Color.graphicBase1
              : Color.graphicBase2
          }
          name={IconsName.arrow_back}
        />
      </IconButton>
      <IconButton
        disabled={!webviewNavigationData?.canGoForward}
        onPress={onPressGoForward}>
        <Icon
          color={
            webviewNavigationData?.canGoForward
              ? Color.graphicBase1
              : Color.graphicBase2
          }
          name={IconsName.arrow_forward}
        />
      </IconButton>
      <Spacer width={12} />
      <TouchableOpacity onPress={handleUrlPress} style={styles.urlContainer}>
        <Icon color={Color.graphicBase2} name={IconsName.lock} i22 />
        <Text numberOfLines={1} clean style={styles.urlText}>
          {clearSiteUrl}
        </Text>
      </TouchableOpacity>
      <Spacer width={15} />
      <First>
        {popup && (
          <IconButton onPress={onPressClose}>
            <Icon color={Color.graphicBase2} name={IconsName.close_circle} />
          </IconButton>
        )}
        <IconButton onLayout={onMoreIconLayout} onPress={onPressMore}>
          <Icon color={Color.graphicBase1} name={IconsName.more} />
        </IconButton>
      </First>
      {!!wallet && (
        <>
          <Spacer width={15} />
          <Animated.View entering={SlideInRight} exiting={SlideOutRight}>
            <WalletRow
              type={WalletRowTypes.variant3}
              item={wallet}
              onPress={handlePressHeaderWallet}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = createTheme({
  urlContainer: {
    backgroundColor: Color.bg8,
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    height: 36,
    flex: 1,
  },
  urlText: {
    color: Color.textBase2,
    fontSize: 17,
    lineHeight: 22,
    marginLeft: 8,
    width: '88%',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: 16,
  },
});
