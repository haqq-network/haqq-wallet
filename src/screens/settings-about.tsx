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
} from '../components/ui';
import {
  BG_3,
  GRAPHIC_BASE_1,
  GRAPHIC_SECOND_3,
  TEXT_BASE_1,
  TEXT_BASE_2,
} from '../variables';

import {openURL, windowWidth} from '../helpers';
import {getAppVersion, getBuildNumber} from '../services/version';

export const SettingsAboutScreen = () => {
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
      <Text t14 style={page.title}>
        About App
      </Text>
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
          <GlobalIcon color={GRAPHIC_BASE_1} />
          <Text t11 style={page.buttonText}>
            Visit islamiccoin.net
          </Text>
          <Spacer />
          <ArrowForwardIcon color={GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Text t14 style={page.title}>
        Legal Documents
      </Text>
      <View style={page.buttons}>
        <IconButton onPress={onPressDoc} style={page.button}>
          <DocIcon color={GRAPHIC_BASE_1} />
          <Text t11 style={page.buttonText}>
            Terms & Conditions
          </Text>
          <Spacer />
          <ArrowForwardIcon color={GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Text t14 style={page.title}>
        Our Socials
      </Text>
      <View style={page.buttons}>
        <IconButton onPress={onPressDiscord} style={page.button}>
          <DiscordIcon color={GRAPHIC_BASE_1} />
          <Text t11 style={page.buttonText}>
            Discord
          </Text>
          <Spacer />
          <ArrowForwardIcon color={GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Text t11 style={page.terms}>
        ©2022 Islamiccoin. All Rights Reserved. Version {getAppVersion()} (
        {getBuildNumber()})
      </Text>
    </ScrollView>
  );
};

const page = StyleSheet.create({
  content: {
    marginHorizontal: 20,
    flexGrow: 1,
  },
  title: {
    marginBottom: 8,
    color: TEXT_BASE_2,
    marginHorizontal: 4,
  },
  buttons: {
    backgroundColor: BG_3,
    borderRadius: 16,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  buttonText: {
    color: TEXT_BASE_1,
    marginLeft: 12,
  },
  terms: {
    color: TEXT_BASE_1,
    marginBottom: 10,
  },
  animation: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    width: windowWidth,
    height: windowWidth * 0.8,
  },
});
