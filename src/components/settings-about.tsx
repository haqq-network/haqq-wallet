import React from 'react';

import {ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {LottieWrap, Spacer, Text} from '@app/components/ui';
import {createTheme, getWindowWidth} from '@app/helpers';
import {I18N} from '@app/i18n';
import {PRIVACY_POLICY, TERMS_OF_CONDITIONS} from '@app/variables/common';

import {SettingsAboutButton} from './settings-about-button';

export const SettingsAbout = () => {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{paddingBottom: insets.bottom}}
      contentContainerStyle={styles.content}>
      <Spacer style={styles.animation}>
        <LottieWrap
          style={styles.imageStyle}
          source={require('@assets/animations/first-screen-animation.json')}
          autoPlay
          loop
        />
      </Spacer>
      <Text t14 i18n={I18N.settingsAboutTitle} style={styles.title} />
      <View style={styles.buttons}>
        {/* <IconButton onPress={onPressRate} style={page.button}>
          <StarIcon color={GRAPHIC_BASE_1} />
          <Text t11 style={page.buttonText}>
            Rate HAQQ wallet App
          </Text>
          <Spacer />
           <Icon i24 name="arrow_forward" color={Color.graphicSecond3} />
        </IconButton> */}
        <SettingsAboutButton
          name="global"
          color={Color.graphicBase1}
          i18n={I18N.settingsAboutVisit}
          url="https://islamiccoin.net"
        />
      </View>
      <Text t14 i18n={I18N.settingsAboutDocuments} style={styles.title} />
      <View style={styles.buttons}>
        <SettingsAboutButton
          name="doc"
          color={Color.graphicBase1}
          i18n={I18N.settingsAboutTerms}
          url={TERMS_OF_CONDITIONS}
        />
        <SettingsAboutButton
          name="doc"
          color={Color.graphicBase1}
          i18n={I18N.settingsAboutPrivacyPolicy}
          url={PRIVACY_POLICY}
        />
      </View>
      <Text t14 i18n={I18N.settingsAboutSocials} style={styles.title} />
      <View style={styles.buttons}>
        <SettingsAboutButton
          name="discord"
          color={Color.graphicBase1}
          i18n={I18N.settingsAboutDiscord}
          url="https://discord.com/invite/aZMm8pekhZ"
        />
        <SettingsAboutButton
          name="twitter_outline"
          color={Color.graphicBase1}
          i18n={I18N.settingsAboutTwitter}
          url="https://twitter.com/Islamic_coin"
        />
      </View>
      <Text
        t11
        center
        color={Color.textBase1}
        i18n={I18N.settingsAboutRights}
        style={styles.terms}
      />
    </ScrollView>
  );
};
const calculateImageSize = () => getWindowWidth() * 0.8;

const styles = createTheme({
  content: {
    marginHorizontal: 20,
    flexGrow: 1,
  },
  title: {
    marginBottom: 8,
    marginHorizontal: 4,
    color: Color.textBase2,
  },
  buttons: {
    backgroundColor: Color.bg3,
    borderRadius: 16,
    marginBottom: 24,
  },
  terms: {
    marginBottom: 10,
  },
  animation: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    width: calculateImageSize,
    height: calculateImageSize,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
});
