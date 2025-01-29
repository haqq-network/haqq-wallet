import React, {useCallback, useMemo, useRef} from 'react';

import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from '@override/react-native-reanimated';
import {
  I18nManager,
  LayoutChangeEvent,
  TouchableOpacity,
  View,
} from 'react-native';
import {WebViewNavigation} from 'react-native-webview';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {ChainId} from '@app/types';
import {IS_ANDROID} from '@app/variables/common';

import {clearUrl} from '../../helpers/web3-browser-utils';
import {Icon, IconButton, IconsName, Spacer, Text} from '../ui';
import {WalletRow, WalletRowTypes} from '../wallet-row';

export interface Web3BrowserPressHeaderEvent {
  siteUrl: string;
  clearSiteUrl: string;
}

interface Web3BrowserHeaderProps {
  walletAddress?: string;
  webviewNavigationData: WebViewNavigation;
  siteUrl: string;
  popup: boolean;
  chainId: ChainId;

  onPressMore(): void;

  onPressHeaderWallet(accountId: string): void;

  onMoreIconLayout(event: LayoutChangeEvent): void;

  onPressGoBack(): void;

  onPressGoForward(): void;

  onPressHeaderUrl(event: Web3BrowserPressHeaderEvent): void;

  onPressClose(): void;
}

export const Web3BrowserHeader = ({
  walletAddress,
  chainId,
  webviewNavigationData,
  siteUrl,
  onPressMore,
  onPressHeaderUrl,
  onMoreIconLayout,
  onPressGoBack,
  onPressGoForward,
  onPressHeaderWallet,
  onPressClose,
  popup,
}: Web3BrowserHeaderProps) => {
  const prevWalletAddress = useRef<string | undefined>(walletAddress);
  const clearSiteUrl = useMemo(() => clearUrl(siteUrl), [siteUrl]);

  const handleUrlPress = useCallback(() => {
    onPressHeaderUrl?.({
      siteUrl,
      clearSiteUrl,
    });
  }, [clearSiteUrl, onPressHeaderUrl, siteUrl]);

  const handlePressHeaderWallet = useCallback(() => {
    if (!walletAddress) {
      return;
    }
    onPressHeaderWallet?.(walletAddress);
  }, [onPressHeaderWallet, walletAddress]);

  const walletEnteringAnimation = useMemo(() => {
    if (!prevWalletAddress.current && walletAddress) {
      prevWalletAddress.current = walletAddress;
      return I18nManager.isRTL ? SlideInLeft : SlideInRight;
    }
    return undefined;
  }, [walletAddress]);
  const walletExitingAnimation = useMemo(() => {
    if (prevWalletAddress.current && !walletAddress) {
      prevWalletAddress.current = walletAddress;
      return I18nManager.isRTL ? SlideOutLeft : SlideOutRight;
    }
    return undefined;
  }, [walletAddress]);

  const stylesHeaderWithRule = [styles.header, IS_ANDROID && {marginTop: 40}];

  const rightIcon = useMemo(() => {
    if (popup) {
      return (
        <IconButton onLayout={onMoreIconLayout} onPress={onPressClose}>
          <Icon color={Color.graphicBase1} name={IconsName.close} />
        </IconButton>
      );
    }

    return (
      <IconButton onLayout={onMoreIconLayout} onPress={onPressMore}>
        <Icon color={Color.graphicBase1} name={IconsName.more} />
      </IconButton>
    );
  }, [onMoreIconLayout, onPressMore, onPressClose, popup]);

  return (
    <View style={stylesHeaderWithRule}>
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
      {rightIcon}
      {!!walletAddress && (
        <>
          <Spacer width={15} />
          <Animated.View
            entering={walletEnteringAnimation}
            exiting={walletExitingAnimation}>
            <WalletRow
              type={WalletRowTypes.variant3}
              item={Wallet.getById(walletAddress)!}
              onPress={handlePressHeaderWallet}
              chainId={chainId}
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
