import React from 'react';

import {LayoutChangeEvent, View} from 'react-native';
import Animated, {SlideInRight, SlideOutRight} from 'react-native-reanimated';
import {WebViewNavigation} from 'react-native-webview';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {Wallet} from '@app/models/wallet';

import {Icon, IconButton, IconsName, Spacer, Text} from '../ui';
import {WalletRow, WalletRowTypes} from '../wallet-row';

interface Web3BrowserHeaderProps {
  wallet: Wallet;
  webviewNavigationData: WebViewNavigation;
  siteClearUrl: string;

  onPressMore(): void;

  onMoreIconLayout(event: LayoutChangeEvent): void;

  onPressGoBack(): void;

  onPressGoForward(): void;
}

export const Web3BrowserHeader = ({
  wallet,
  webviewNavigationData,
  siteClearUrl,
  onPressMore,
  onMoreIconLayout,
  onPressGoBack,
  onPressGoForward,
}: Web3BrowserHeaderProps) => {
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
      <View style={styles.urlContainer}>
        <Icon color={Color.graphicBase2} name={IconsName.lock} i22 />
        <Text numberOfLines={1} clean style={styles.urlText}>
          {siteClearUrl}
        </Text>
      </View>
      <Spacer width={15} />
      <IconButton onLayout={onMoreIconLayout} onPress={onPressMore}>
        <Icon color={Color.graphicBase1} name={IconsName.more} />
      </IconButton>
      {!!wallet && (
        <>
          <Spacer width={15} />
          <Animated.View entering={SlideInRight} exiting={SlideOutRight}>
            <WalletRow type={WalletRowTypes.variant3} item={wallet} />
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
