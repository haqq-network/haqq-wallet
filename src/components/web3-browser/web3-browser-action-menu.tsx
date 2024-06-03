import React, {useMemo} from 'react';

import {I18nManager, LayoutRectangle, StyleSheet, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {SHADOW_L} from '@app/variables/shadows';

import {DataContent, First, Icon, IconButton, IconsName} from '../ui';

const ACTION_MENU_WIDTH = 220;
const ACTION_MENU_PADDING_HORIZONTAL = 16;

interface Web3BrowserActionMenuProps {
  walletAddress?: string;
  showActionMenu: boolean;
  isSiteInBookmarks: boolean;
  currentProvider: Provider;
  currentSessionOrigin?: string;
  moreIconLayout: Partial<LayoutRectangle>;
  popup?: boolean;

  onPressClose(): void;

  toggleActionMenu(): void;

  onPressProviders(): void;

  onPressHome(): void;

  onPressRefresh(): void;

  onPressCopyLink(): void;

  onPressDisconnect(): void;

  onPressShare(): void;

  onPressAddBookmark(): void;

  onPressRemoveBookmark(): void;

  onPressPrivacy(): void;
}

export const Web3BrowserActionMenu = ({
  walletAddress,
  showActionMenu,
  currentProvider,
  moreIconLayout,
  isSiteInBookmarks,
  currentSessionOrigin,
  popup,
  onPressClose,
  toggleActionMenu,
  onPressProviders,
  onPressHome,
  onPressAddBookmark,
  onPressRemoveBookmark,
  onPressRefresh,
  onPressCopyLink,
  onPressDisconnect,
  onPressShare,
  onPressPrivacy,
}: Web3BrowserActionMenuProps) => {
  const insets = useSafeAreaInsets();
  const isRTL = useMemo(() => I18nManager.isRTL, []);
  const actionMenuStyle = useMemo(() => {
    const x = moreIconLayout.x! - ACTION_MENU_WIDTH + moreIconLayout.width! * 2;
    const y = moreIconLayout.height! + moreIconLayout.y! + 5 + insets.top;

    return {
      left: isRTL ? -x : x,
      top: isRTL ? y + 5 : y,
    };
  }, [isRTL]);
  return (
    <>
      {showActionMenu && (
        <>
          <View
            onTouchEnd={toggleActionMenu}
            style={[
              StyleSheet.absoluteFill,
              styles.actionMenuOverlay,
              {top: insets.top},
            ]}
          />
          <Animated.View
            style={[styles.actionMenu, actionMenuStyle]}
            entering={FadeIn}
            exiting={FadeOut}>
            {!!currentSessionOrigin && (
              <>
                <IconButton
                  style={styles.actionMenuButton}
                  onPress={onPressProviders}>
                  <DataContent
                    short
                    titleI18n={I18N.browserActionMenuProviders}
                    subtitle={currentProvider?.name}
                  />
                  <Icon name={IconsName.providers} color={Color.graphicBase1} />
                </IconButton>
                <View style={styles.moreButtonSeparator} />
              </>
            )}
            <First>
              {!!popup && (
                <IconButton
                  style={styles.actionMenuButton}
                  onPress={onPressClose}>
                  <DataContent short titleI18n={I18N.browserActionMenuClose} />
                  <Icon name={IconsName.close} color={Color.graphicBase1} />
                </IconButton>
              )}
              <IconButton style={styles.actionMenuButton} onPress={onPressHome}>
                <DataContent short titleI18n={I18N.browserActionMenuHome} />
                <Icon name={IconsName.global} color={Color.graphicBase1} />
              </IconButton>
            </First>
            <View style={styles.moreButtonSeparator} />
            {!isSiteInBookmarks && (
              <>
                <IconButton
                  style={styles.actionMenuButton}
                  onPress={onPressAddBookmark}>
                  <DataContent
                    short
                    titleI18n={I18N.browserActionMenuAddToBookmarks}
                  />
                  <Icon name={IconsName.star} color={Color.graphicBase1} />
                </IconButton>
                <View style={styles.moreButtonSeparator} />
              </>
            )}
            {isSiteInBookmarks && (
              <>
                <IconButton
                  style={styles.actionMenuButton}
                  onPress={onPressRemoveBookmark}>
                  <DataContent
                    short
                    titleI18n={I18N.browserActionMenuRemoveFromBookmarks}
                    numberOfLines={2}
                  />
                  <Icon name={IconsName.star_fill} color={Color.graphicBase1} />
                </IconButton>
                <View style={styles.moreButtonSeparator} />
              </>
            )}
            <IconButton
              style={styles.actionMenuButton}
              onPress={onPressRefresh}>
              <DataContent short titleI18n={I18N.browserActionMenuRefresh} />
              <Icon name={IconsName.refresh} color={Color.graphicBase1} />
            </IconButton>
            <View style={styles.moreButtonSeparator} />
            <IconButton
              style={styles.actionMenuButton}
              onPress={onPressCopyLink}>
              <DataContent short titleI18n={I18N.browserActionMenuCopyLink} />
              <Icon name={IconsName.copy} color={Color.graphicBase1} />
            </IconButton>
            <View style={styles.moreButtonSeparator} />
            <IconButton style={styles.actionMenuButton} onPress={onPressShare}>
              <DataContent short titleI18n={I18N.browserActionMenuShare} />
              <Icon name={IconsName.share} color={Color.graphicBase1} />
            </IconButton>
            <View style={styles.moreButtonSeparator} />
            <IconButton
              style={styles.actionMenuButton}
              onPress={onPressPrivacy}>
              <DataContent short titleI18n={I18N.browserPrivacy} />
              <Icon name={IconsName.privacy} color={Color.graphicBase1} />
            </IconButton>
            {!!walletAddress && (
              <>
                <View style={styles.moreButtonSeparator} />
                <IconButton
                  style={styles.actionMenuButton}
                  onPress={onPressDisconnect}>
                  <DataContent
                    short
                    titleI18n={I18N.browserActionMenuDisconnect}
                  />
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
    height: 1,
    opacity: 0.5,
  },
  actionMenuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionMenu: {
    position: 'absolute',
    width: ACTION_MENU_WIDTH,
    borderRadius: 12,
    paddingHorizontal: ACTION_MENU_PADDING_HORIZONTAL,
    ...SHADOW_L,
  },
  actionMenuOverlay: {
    width: '100%',
    height: '100%',
  },
});
