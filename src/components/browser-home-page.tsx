import React, {useCallback} from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Button, ButtonVariant, LottieWrap} from '@app/components/ui';
import {useThemeSelector} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Link} from '@app/types';

import {BrowserHomePageLinkList} from './browser-home-page-link-list';
import {TopTabNavigator} from './top-tab-navigator';

export interface BrowserHomePageProps {
  favouriteLinks: Link[];
  recentLinks: Link[];

  onSearchPress(): void;

  onFavouritePress(link: Link): void;

  onRecentPress(link: Link): void;

  onEditFavouritePress(): void;

  onClearRecentPress(): void;
}

export const BrowserHomePage = ({
  favouriteLinks,
  recentLinks,
  // onSearchPress,
  onFavouritePress,
  onRecentPress,
  onClearRecentPress,
  onEditFavouritePress,
}: BrowserHomePageProps) => {
  const animation = useThemeSelector({
    light: require('@assets/animations/islm-logo-dotted-circle-light.json'),
    dark: require('@assets/animations/islm-logo-dotted-circle-dark.json'),
  });

  const renderFavouriteTab = useCallback(
    () => (
      <BrowserHomePageLinkList
        emptyText={I18N.thereNoBookmarks}
        onLinkPress={onFavouritePress}
        links={favouriteLinks}
      />
    ),
    [favouriteLinks, onFavouritePress],
  );

  const renderRecentTab = useCallback(
    () => (
      <BrowserHomePageLinkList
        emptyText={I18N.thereNoRecentSites}
        onLinkPress={onRecentPress}
        links={recentLinks}
      />
    ),
    [onRecentPress, recentLinks],
  );

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieWrap style={styles.animation} autoPlay loop source={animation} />
      </View>
      <View style={styles.searchContainer}>
        {/*<TouchableOpacity onPress={onSearchPress}>*/}
        {/*  <Input*/}
        {/*    leftAction={*/}
        {/*      <Icon color={Color.graphicBase2} name={IconsName.search} />*/}
        {/*    }*/}
        {/*    placeholder={getText(I18N.browserEnterSiteNameOrURL)}*/}
        {/*    keyboardType={'web-search'}*/}
        {/*    editable={false}*/}
        {/*    onPressIn={onSearchPress}*/}
        {/*  />*/}
        {/*</TouchableOpacity>*/}
      </View>

      <View>
        <TopTabNavigator>
          <TopTabNavigator.Tab
            name={'favourite'}
            title={I18N.favourite}
            component={renderFavouriteTab}
            rigntActon={
              <Button
                textStyle={styles.tabActionButton}
                style={styles.tabActionButton}
                i18n={I18N.edit}
                onPress={onEditFavouritePress}
                variant={ButtonVariant.text}
                textColor={Color.textGreen1}
              />
            }
          />
          <TopTabNavigator.Tab
            name={'recent'}
            title={I18N.recent}
            component={renderRecentTab}
            rigntActon={
              <Button
                textStyle={styles.tabActionButton}
                style={styles.tabActionButton}
                i18n={I18N.clear}
                onPress={onClearRecentPress}
                variant={ButtonVariant.text}
                textColor={Color.textGreen1}
              />
            }
          />
        </TopTabNavigator>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabActionButton: {
    height: 22,
  },
  animationContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    width: '100%',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  animation: {
    width: 330,
    height: 330,
  },
});
