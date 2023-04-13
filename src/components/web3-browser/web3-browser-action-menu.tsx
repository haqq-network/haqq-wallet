import React from 'react';

import {LayoutRectangle, StyleSheet, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {SHADOW_COLOR_1} from '@app/variables/common';

import {DataContent, Icon, IconButton, IconsName} from '../ui';

const ACTION_MENU_WIDTH = 220;
const ACTION_MENU_PADDING_HORIZONTAL = 16;

interface Web3BrowserActionMenuProps {
  wallet: Wallet;
  showActionMenu: boolean;
  currentProvider: Provider;
  currentSession: Web3BrowserSession;
  moreIconLayout: Partial<LayoutRectangle>;
  toggleActionMenu(): void;
  onPressProviders(): void;
  onPressHome(): void;
  onPressRefresh(): void;
  onPressCopyLink(): void;
  onPressDisconnect(): void;
  onPressShare(): void;
  onPressAddBookmark(): void;
}

export const Web3BrowserActionMenu = ({
  wallet,
  showActionMenu,
  currentProvider,
  moreIconLayout,
  currentSession,
  toggleActionMenu,
  onPressProviders,
  onPressHome,
  onPressAddBookmark,
  onPressRefresh,
  onPressCopyLink,
  onPressDisconnect,
  onPressShare,
}: Web3BrowserActionMenuProps) => {
  return (
    <>
      {showActionMenu && (
        <>
          <View
            onTouchEnd={toggleActionMenu}
            style={[StyleSheet.absoluteFill, styles.actionMenuOverlay]}
          />
          <Animated.View
            style={[
              styles.actionMenu,
              {
                left:
                  moreIconLayout.x! -
                  ACTION_MENU_WIDTH +
                  moreIconLayout.width! * 2,
                top: moreIconLayout.height! + moreIconLayout.y! + 5,
              },
            ]}
            entering={FadeIn}
            exiting={FadeOut}>
            {!!currentSession && (
              <IconButton
                style={styles.actionMenuButton}
                onPress={onPressProviders}>
                <DataContent
                  short
                  title={'Providers'}
                  subtitle={currentProvider?.name}
                />
                <Icon name={IconsName.providers} color={Color.graphicBase1} />
              </IconButton>
            )}
            <View style={styles.moreButtonSeparator} />
            <IconButton style={styles.actionMenuButton} onPress={onPressHome}>
              <DataContent short title={'Home'} />
              <Icon name={IconsName.global} color={Color.graphicBase1} />
            </IconButton>
            <View style={styles.moreButtonSeparator} />
            <IconButton
              style={styles.actionMenuButton}
              onPress={onPressAddBookmark}>
              <DataContent short title={'Add to Bookmarks'} />
              <Icon name={IconsName.star} color={Color.graphicBase1} />
            </IconButton>
            <View style={styles.moreButtonSeparator} />
            <IconButton
              style={styles.actionMenuButton}
              onPress={onPressRefresh}>
              <DataContent short title={'Refresh'} />
              <Icon name={IconsName.refresh} color={Color.graphicBase1} />
            </IconButton>
            <View style={styles.moreButtonSeparator} />
            <IconButton
              style={styles.actionMenuButton}
              onPress={onPressCopyLink}>
              <DataContent short title={'Copy link'} />
              <Icon name={IconsName.copy} color={Color.graphicBase1} />
            </IconButton>
            <View style={styles.moreButtonSeparator} />
            <IconButton style={styles.actionMenuButton} onPress={onPressShare}>
              <DataContent short title={'Share'} />
              <Icon name={IconsName.share} color={Color.graphicBase1} />
            </IconButton>
            {!!wallet && (
              <>
                <View style={styles.moreButtonSeparator} />
                <IconButton
                  style={styles.actionMenuButton}
                  onPress={onPressDisconnect}>
                  <DataContent short title={'Disconnect'} />
                  <Icon
                    name={IconsName.disconnect}
                    color={Color.graphicBase1}
                  />
                </IconButton>
              </>
            )}
          </Animated.View>
        </>
      )}
    </>
  );
};

const styles = createTheme({
  moreButtonSeparator: {
    width: ACTION_MENU_WIDTH,
    transform: [{translateX: -ACTION_MENU_PADDING_HORIZONTAL}],
    backgroundColor: Color.graphicSecond2,
    height: 0.5,
  },
  actionMenuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionMenu: {
    position: 'absolute',
    backgroundColor: Color.bg1,
    width: ACTION_MENU_WIDTH,
    borderRadius: 12,
    paddingHorizontal: ACTION_MENU_PADDING_HORIZONTAL,
    shadowColor: SHADOW_COLOR_1,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 24,
    elevation: 13,
  },
  actionMenuOverlay: {
    width: '100%',
    height: '100%',
  },
});
