import React from 'react';

import {StyleSheet} from 'react-native';

import {I18N} from '@app/i18n';

import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from './ui';

export type FinishProps = {
  title?: string;
  i18n?: I18N;
  i18params?: Record<string, string>;
  onFinish: () => void;
  testID?: string;
};

export const Finish = ({
  title = undefined,
  onFinish,
  testID,
  i18n = undefined,
  i18params = undefined,
}: FinishProps) => {
  return (
    <PopupContainer>
      <Spacer>
        <LottieWrap
          source={require('../../assets/animations/success-animation.json')}
          autoPlay
          loop={false}
        />
      </Spacer>
      <Text t4 i18n={i18n} i18params={i18params} style={page.title}>
        {title}
      </Text>
      <Button
        style={page.button}
        variant={ButtonVariant.contained}
        title="Finish"
        testID={`${testID}_finish`}
        onPress={onFinish}
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  title: {
    marginBottom: 76,
    textAlign: 'center',
    width: 300,
    alignSelf: 'center',
    marginHorizontal: 20,
  },
  button: {
    marginBottom: 16,
    marginHorizontal: 20,
  },
});
