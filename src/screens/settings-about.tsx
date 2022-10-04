import React, {useCallback} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {
  ArrowForwardIcon,
  Container,
  DiscordIcon,
  DocIcon,
  GlobalIcon,
  IconButton,
  Paragraph,
  ParagraphSize,
  Spacer,
  StarIcon,
} from '../components/ui';
import {
  BG_3,
  GRAPHIC_BASE_1,
  GRAPHIC_SECOND_3,
  TEXT_BASE_1,
} from '../variables';
import Lottie from 'lottie-react-native';
import {openURL} from '../helpers';
import {useIsFocused} from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;

export const SettingsAboutScreen = () => {
  const isFocused = useIsFocused();
  console.log('isFocused', isFocused);

  const onPressRate = useCallback(async () => {
    const url = 'https://example.com';
    openURL(url);
  }, []);

  const onPressSite = useCallback(async () => {
    const url = 'https://islamiccoin.net';
    openURL(url);
  }, []);

  const onPressDoc = useCallback(async () => {
    const url = 'https://islamiccoin.net';
    openURL(url);
  }, []);

  const onPressDiscord = useCallback(async () => {
    const url = 'https://discord.com/invite/aZMm8pekhZ';
    openURL(url);
  }, []);

  return (
    <Container>
      <Spacer>
        <Lottie
          style={[
            page.imageStyle,
            {
              width: windowWidth - 40,
              height: windowWidth - 40,
            },
          ]}
          source={require('../../assets/animations/first-screen-animation.json')}
          autoPlay
          loop
        />
      </Spacer>

      <Paragraph size={ParagraphSize.s} style={page.title}>
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
      <Paragraph size={ParagraphSize.s} style={page.title}>
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
      <Paragraph size={ParagraphSize.s} style={page.title}>
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
  imageStyle: {
    position: 'absolute',
    top: -20,
  },
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
});
