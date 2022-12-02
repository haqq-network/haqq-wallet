import React, {useCallback} from 'react';

import {ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';

import {
  ArrowForwardIcon,
  DiscordIcon,
  DocIcon,
  GlobalIcon,
  Icon,
  IconButton,
  LottieWrap,
  Spacer,
  Text,
} from '../components/ui';
import {createTheme, openURL, windowWidth} from '../helpers';
import {getAppVersion, getBuildNumber} from '../services/version';
import {
  LIGHT_BG_3,
  LIGHT_GRAPHIC_BASE_1,
  LIGHT_GRAPHIC_SECOND_3,
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_BASE_2,
} from '../variables';

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

  const onPressTwitter = useCallback(() => {
    const url = 'https://twitter.com/Islamic_coin';
    openURL(url);
  }, []);

  // const onPressInstagram = useCallback(() => {
  //   const url = 'https://twitter.com/Islamic_coin';
  //   openURL(url);
  // }, []);

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
          <GlobalIcon color={LIGHT_GRAPHIC_BASE_1} />
          <Text t11 style={page.buttonText}>
            Visit islamiccoin.net
          </Text>
          <Spacer />
          <ArrowForwardIcon color={LIGHT_GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Text t14 style={page.title}>
        Legal Documents
      </Text>
      <View style={page.buttons}>
        <IconButton onPress={onPressDoc} style={page.button}>
          <DocIcon color={LIGHT_GRAPHIC_BASE_1} />
          <Text t11 style={page.buttonText}>
            Terms & Conditions
          </Text>
          <Spacer />
          <ArrowForwardIcon color={LIGHT_GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Text t14 style={page.title}>
        Our Socials
      </Text>
      <View style={page.buttons}>
        <IconButton onPress={onPressDiscord} style={page.button}>
          <DiscordIcon color={LIGHT_GRAPHIC_BASE_1} />
          <Text t11 style={page.buttonText}>
            Discord
          </Text>
          <Spacer />
          <ArrowForwardIcon color={LIGHT_GRAPHIC_SECOND_3} />
        </IconButton>
        <IconButton onPress={onPressTwitter} style={page.button}>
          <Icon name="twitter" color={Color.graphicBase1} />
          <Text t11 style={page.buttonText}>
            Twitter
          </Text>
          <Spacer />
          <ArrowForwardIcon color={LIGHT_GRAPHIC_SECOND_3} />
        </IconButton>
        {/*<IconButton onPress={onPressInstagram} style={page.button}>*/}
        {/*  <Icon name="instagram" color={Color.graphicBase1} />*/}
        {/*  <Text t11 style={page.buttonText}>*/}
        {/*    Instagram*/}
        {/*  </Text>*/}
        {/*  <Spacer />*/}
        {/*  <ArrowForwardIcon color={LIGHT_GRAPHIC_SECOND_3} />*/}
        {/*</IconButton>*/}
      </View>
      <Text t11>©2022 Haqq. All Rights Reserved.</Text>
      <Text t11 style={page.terms}>
        Version {getAppVersion()} ({getBuildNumber()})
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
