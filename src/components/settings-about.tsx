import React from 'react';

import {ScrollView, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {LottieWrap, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {IconSettingsAbout} from './IconSettingsAbout';

export const SettingsAbout = () => {
  const insets = useSafeAreaInsets();
  const windowWidth = useWindowDimensions().width;
  return (
    <ScrollView
      style={{paddingBottom: insets.bottom}}
      contentContainerStyle={styles.content}>
      <Spacer style={styles.animation}>
        <LottieWrap
          style={[
            styles.imageStyle,
            {width: windowWidth, height: windowWidth * 0.9},
          ]}
          source={require('../../assets/animations/first-screen-animation.json')}
          autoPlay
          loop
        />
      </Spacer>
      <Text t14 i18n={I18N.settingsAboutTitle} style={styles.title} />
      <View style={styles.buttons}>
        {/* <IconButton onPress={onPressRate} style={page.button}>
          <StarIcon color={GRAPHIC_BASE_1} />
          <Text t11 style={page.buttonText}>
            Rate ISLM wallet App
          </Text>
          <Spacer />
           <Icon i24 name="arrow_forward" color={Color.graphicSecond3} />
        </IconButton> */}
        <IconSettingsAbout
          name="global"
          color={Color.graphicBase1}
          i18n={I18N.settingsAboutVisit}
          url="https://islamiccoin.net"
        />
      </View>
      <Text t14 i18n={I18N.settingsAboutDocuments} style={styles.title} />
      <View style={styles.buttons}>
        <IconSettingsAbout
          name="doc"
          color={Color.graphicBase1}
          i18n={I18N.settingsAboutTerms}
          url="https://islamiccoin.net"
        />
      </View>
      <Text t14 i18n={I18N.settingsAboutSocials} style={styles.title} />
      <View style={styles.buttons}>
        <IconSettingsAbout
          name="discord"
          color={Color.graphicBase1}
          i18n={I18N.settingsAboutDiscord}
          url="https://discord.com/invite/aZMm8pekhZ"
        />
        <IconSettingsAbout
          name="twitter"
          color={Color.graphicBase1}
          i18n={I18N.settingsAboutTwitter}
          url="https://twitter.com/Islamic_coin"
        />
      </View>
      <Text
        t11
        color={Color.textBase1}
        i18n={I18N.settingsAboutRights}
        style={styles.terms}
      />
    </ScrollView>
  );
};

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
    marginTop: -10,
    marginBottom: -20,
    alignSelf: 'center',
  },
});
