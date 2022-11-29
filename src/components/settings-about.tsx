import React, {useCallback} from 'react';

import {ScrollView, StyleSheet, View} from 'react-native';
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
import { openURL, windowWidth, createTheme } from '@app/helpers';
import { I18N } from '@app/i18n';

import {
  LIGHT_BG_3,
  LIGHT_GRAPHIC_BASE_1,
  LIGHT_GRAPHIC_SECOND_3,
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_BASE_2,
} from '@app/variables';

export const SettingsAbout = () => {
  const insets = useSafeAreaInsets();

  // const onPressRate = useCallback(() => {
  //   const url = 'https://example.com';
  //   openURL(url);
  // }, []);

  const onPressSite = useCallback(() => {
    const url = 'https://islamiccoin.net';
    openURL(url);
  }, []);

  const onPressDoc = useCallback(() => {
    const url = 'https://islamiccoin.net';
    openURL(url);
  }, []);

  const onPressDiscord = useCallback(() => {
    const url = 'https://discord.com/invite/aZMm8pekhZ';
    openURL(url);
  }, []);

  return (
    <ScrollView
      style={{paddingBottom: insets.bottom}}
      contentContainerStyle={page.content}>
      <Spacer style={page.animation}>
        <LottieWrap
          style={page.imageStyle}
          source={require('../../assets/animations/first-screen-animation.json')}
          autoPlay
          loop
        />
      </Spacer>
      <Text t14 i18n={I18N.settingsAboutTitle} style={page.title}/>
      <View style={page.buttons}>
        {/* <IconButton onPress={onPressRate} style={page.button}>
          <StarIcon color={GRAPHIC_BASE_1} />
          <Text t11 style={page.buttonText}>
            Rate ISLM wallet App
          </Text>
          <Spacer />
          <ArrowForwardIcon color={GRAPHIC_SECOND_3} />
        </IconButton> */}
        <IconButton onPress={onPressSite} style={page.button}>
          <GlobalIcon color={LIGHT_GRAPHIC_BASE_1} />
          <Text t11 i18n={I18N.settingsAboutVisit} style={page.buttonText} />
          <Spacer />
          <ArrowForwardIcon color={LIGHT_GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Text t14 i18n={I18N.settingsAboutDocuments} style={page.title}/>
      <View style={page.buttons}>
        <IconButton onPress={onPressDoc} style={page.button}>
          <DocIcon color={LIGHT_GRAPHIC_BASE_1} />
          <Text t11 i18n={I18N.settingsAboutTerms} style={page.buttonText}/>
          <Spacer />
          <ArrowForwardIcon color={LIGHT_GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Text t14 i18n={I18N.settingsAboutSocials} style={page.title}/>
      <View style={page.buttons}>
        <IconButton onPress={onPressDiscord} style={page.button}>
          <DiscordIcon color={LIGHT_GRAPHIC_BASE_1} />
          <Text t11 i18n={I18N.settingsAboutDiscord} style={page.buttonText}/>
          <Spacer />
          <ArrowForwardIcon color={LIGHT_GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Text t11 i18n={I18N.settingsAboutRights} style={page.terms}>
        
      </Text>
    </ScrollView>
  );
};

const page = createTheme({
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
