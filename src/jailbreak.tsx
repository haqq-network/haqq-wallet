import React, {useEffect} from 'react';

import {Image, SafeAreaView, View} from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import {Spacer, StatusBarColor, Text} from '@app/components/ui';
import {onTrackEvent} from '@app/event-actions/on-track-event';

import {Color, getColor} from './colors';
import {createTheme} from './helpers';
import {useTheme} from './hooks';
import {I18N} from './i18n';
import {AdjustEvents, AppTheme} from './types';

export const Jailbreak = () => {
  const theme = useTheme();

  useEffect(() => {
    SplashScreen.hide();
    onTrackEvent(AdjustEvents.stakingValidators);
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <Image source={require('@assets/images/jailbreak.png')} />
        <StatusBarColor
          barStyle={theme === AppTheme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={getColor(Color.bg1)}
        />
        <Spacer height={48} />
        <Text center t4 color={Color.textBase3} i18n={I18N.jailbreakTitle} />
        <Spacer height={12} />
        <Text
          center
          t11
          color={Color.textBase3}
          i18n={I18N.jailbreakDescription1}
        />
        <Spacer height={24} />
        <View style={styles.whiteBox}>
          <Text
            center
            t9
            color={Color.textRed1}
            i18n={I18N.jailbreakDescription2}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    backgroundColor: Color.graphicRed1,
  },
  content: {
    flex: 1,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteBox: {
    backgroundColor: Color.bg1,
    padding: 16,
    borderRadius: 13,
  },
});
