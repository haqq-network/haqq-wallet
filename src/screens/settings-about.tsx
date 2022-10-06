import React, {useCallback} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {
  ArrowForwardIcon,
  Container,
  DiscordIcon,
  DocIcon,
  GlobalIcon,
  IconButton,
  Text,
  Spacer,
  StarIcon,
  LottieWrap,
} from '../components/ui';
import {
  BG_3,
  GRAPHIC_BASE_1,
  GRAPHIC_SECOND_3,
  TEXT_BASE_1,
} from '../variables';

import {openURL} from '../helpers';

const windowWidth = Dimensions.get('window').width;

export const SettingsAboutScreen = () => {
  const onPressRate = useCallback(() => {
    const url = 'https://example.com';
    openURL(url);
  }, []);

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
    <Container>
      <Spacer>
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
        <IconButton onPress={onPressRate} style={page.button}>
          <StarIcon color={GRAPHIC_BASE_1} />
          <Text style={page.buttonText}>Rate ISLM wallet App</Text>
          <Spacer />
          <ArrowForwardIcon color={GRAPHIC_SECOND_3} />
        </IconButton>
        <IconButton onPress={onPressSite} style={page.button}>
          <GlobalIcon color={GRAPHIC_BASE_1} />
          <Text style={page.buttonText}>Visit islamiccoin.net</Text>
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
          <Text style={page.buttonText}>Terms & Conditions</Text>
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
          <Text style={page.buttonText}>Discord</Text>
          <Spacer />
          <ArrowForwardIcon color={GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Text style={page.terms}>
        ©2022 Islamiccoin. All Rights Reserved. Version 1.0.0 (112)
      </Text>
    </Container>
  );
};

const page = StyleSheet.create({
  title: {
    marginBottom: 8,
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
  imageStyle: {
    position: 'absolute',
    top: -20,
    width: windowWidth - 40,
    height: windowWidth - 40,
  },
});
