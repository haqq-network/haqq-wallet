import React from 'react';
import {Dimensions} from 'react-native';
import {Container, LottieWrap, Text} from '../components/ui';

export const SettingsTestScreen = () => {
  const onPress = async () => {};

  return (
    <Container style={{justifyContent: 'center', alignItems: 'center'}}>
      <Text t9 style={{flex: 0}}>
        verify address son your Ledger Nano X by pressing both buttons together
      </Text>
      <LottieWrap
        style={{
          width: Dimensions.get('window').width,
        }}
        source={require('../../assets/animations/ledger-verify.json')}
        autoPlay
        loop={false}
      />
    </Container>
  );
};
