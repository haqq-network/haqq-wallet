import React from 'react';

import {ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  ArrowForwardIcon,
  DiscordIcon,
  DocIcon,
  GlobalIcon,
  IconButton,
  LottieWrap,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, windowWidth} from '@app/helpers';
import {I18N} from '@app/i18n';
import {
  LIGHT_BG_3,
  LIGHT_GRAPHIC_BASE_1,
  LIGHT_GRAPHIC_SECOND_3,
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_BASE_2,
} from '@app/variables';

type SettingsAboutProps = {
  onPressSite: () => void;
  onPressDoc: () => void;
  onPressDiscord: () => void;
};

export const SettingsAbout = ({
  onPressSite,
  onPressDoc,
  onPressDiscord,
}: SettingsAboutProps) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{paddingBottom: insets.bottom}}
      contentContainerStyle={styles.content}>
      <Spacer style={styles.animation}>
        <LottieWrap
          style={styles.imageStyle}
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
          <ArrowForwardIcon color={GRAPHIC_SECOND_3} />
        </IconButton> */}
        <IconButton onPress={onPressSite} style={styles.button}>
          <GlobalIcon color={LIGHT_GRAPHIC_BASE_1} />
          <Text t11 i18n={I18N.settingsAboutVisit} style={styles.buttonText} />
          <Spacer />
          <ArrowForwardIcon color={LIGHT_GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Text t14 i18n={I18N.settingsAboutDocuments} style={styles.title} />
      <View style={styles.buttons}>
        <IconButton onPress={onPressDoc} style={styles.button}>
          <DocIcon color={LIGHT_GRAPHIC_BASE_1} />
          <Text t11 i18n={I18N.settingsAboutTerms} style={styles.buttonText} />
          <Spacer />
          <ArrowForwardIcon color={LIGHT_GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Text t14 i18n={I18N.settingsAboutSocials} style={styles.title} />
      <View style={styles.buttons}>
        <IconButton onPress={onPressDiscord} style={styles.button}>
          <DiscordIcon color={LIGHT_GRAPHIC_BASE_1} />
          <Text
            t11
            i18n={I18N.settingsAboutDiscord}
            style={styles.buttonText}
          />
          <Spacer />
          <ArrowForwardIcon color={LIGHT_GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Text t11 i18n={I18N.settingsAboutRights} style={styles.terms} />
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
    color: LIGHT_TEXT_BASE_2,
    marginHorizontal: 4,
  },
  buttons: {
    backgroundColor: LIGHT_BG_3,
    borderRadius: 16,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  buttonText: {
    color: LIGHT_TEXT_BASE_1,
    marginLeft: 12,
  },
  terms: {
    color: LIGHT_TEXT_BASE_1,
    marginBottom: 10,
  },
  animation: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    width: windowWidth,
    height: windowWidth * 0.9,
    marginTop: -10,
    marginBottom: -20,
    alignSelf: 'center',
  },
});
