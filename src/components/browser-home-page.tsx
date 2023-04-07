import React from 'react';

import {StyleSheet, TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconsName, Input, LottieWrap} from '@app/components/ui';
import {useThemeSelector} from '@app/hooks';
import {I18N, getText} from '@app/i18n';

// const TEST_URLS = [
//   'https://app.haqq.network',
//   'https://vesting.haqq.network',
//   'https://app.uniswap.org',
//   'https://testedge2.haqq.network',
//   'https://safe.testedge2.haqq.network',
//   'https://metamask.github.io/test-dapp/',
// ];

export interface BrowserHomePageProps {
  onSearchPress(): void;
}

export const BrowserHomePage = ({onSearchPress}: BrowserHomePageProps) => {
  const animation = useThemeSelector({
    light: require('@assets/animations/islm-logo-dotted-circle-light.json'),
    dark: require('@assets/animations/islm-logo-dotted-circle-dark.json'),
  });

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieWrap style={styles.animation} autoPlay loop source={animation} />
      </View>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={onSearchPress}>
          <Input
            leftAction={
              <Icon color={Color.graphicBase2} name={IconsName.search} />
            }
            placeholder={getText(I18N.browserEnterSiteNameOrURL)}
            keyboardType={'web-search'}
            editable={false}
            onPressIn={onSearchPress}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 0.7,
    width: '100%',
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
