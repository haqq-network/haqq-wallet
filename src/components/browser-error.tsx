import React from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks';
import {I18N} from '@app/i18n';

import {Spacer, Text} from './ui';

export interface BrowserErrorProps {
  reason: string;
}

export const BrowserError = ({reason}: BrowserErrorProps) => {
  const image = useThemeSelector({
    light: require('@assets/images/browser-error-light.png'),
    dark: require('@assets/images/browser-error-dark.png'),
  });

  return (
    <View style={styles.container}>
      <Image source={image} />
      <Spacer height={20} />
      <Text t7 i18n={I18N.errorLoadingPage} />
      <Spacer height={4} />
      {!!reason && <Text t14 i18n={I18N.errorReason} i18params={{reason}} />}
    </View>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    backgroundColor: Color.bg1,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: '100%',
    width: '100%',
    paddingHorizontal: 15,
  },
});
