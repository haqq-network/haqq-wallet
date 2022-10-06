import React, {useCallback} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {
  ArrowForwardIcon,
  Container,
  DiscordIcon,
  DocIcon,
  GlobalIcon,
  IconButton,
  Paragraph,
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
      <Paragraph p3 style={page.title}>
        About App
      </Paragraph>
      <View style={page.buttons}>
        <IconButton onPress={onPressRate} style={page.button}>
          <StarIcon color={GRAPHIC_BASE_1} />
          <Paragraph style={page.buttonText}>Rate ISLM wallet App</Paragraph>
          <Spacer />
          <ArrowForwardIcon color={GRAPHIC_SECOND_3} />
        </IconButton>
        <IconButton onPress={onPressSite} style={page.button}>
          <GlobalIcon color={GRAPHIC_BASE_1} />
          <Paragraph style={page.buttonText}>Visit islamiccoin.net</Paragraph>
          <Spacer />
          <ArrowForwardIcon color={GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Paragraph p3 style={page.title}>
        Legal Documents
      </Paragraph>
      <View style={page.buttons}>
        <IconButton onPress={onPressDoc} style={page.button}>
          <DocIcon color={GRAPHIC_BASE_1} />
          <Paragraph style={page.buttonText}>Terms & Conditions</Paragraph>
          <Spacer />
          <ArrowForwardIcon color={GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Paragraph p3 style={page.title}>
        Our Socials
      </Paragraph>
      <View style={page.buttons}>
        <IconButton onPress={onPressDiscord} style={page.button}>
          <DiscordIcon color={GRAPHIC_BASE_1} />
          <Paragraph style={page.buttonText}>Discord</Paragraph>
          <Spacer />
          <ArrowForwardIcon color={GRAPHIC_SECOND_3} />
        </IconButton>
      </View>
      <Paragraph style={page.terms}>
        ©2022 Islamiccoin. All Rights Reserved. Version 1.0.0 (112)
      </Paragraph>
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
