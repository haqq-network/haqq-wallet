import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from './ui';

export type FinishProps = {
  title: string;
  onFinish: () => void;
  testID?: string;
};

export const Finish = ({title, onFinish, testID}: FinishProps) => {
  return (
    <PopupContainer>
      <Spacer>
        <LottieWrap
          source={require('../../assets/animations/success-animation.json')}
          autoPlay
          loop={false}
        />
      </Spacer>
      <Text t4 style={page.title}>
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
