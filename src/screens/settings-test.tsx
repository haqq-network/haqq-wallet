import React from 'react';
import {Button, Container, Spacer, Text} from '../components/ui';

export const SettingsTestScreen = () => {
  const onPress = async () => {};

  return (
    <Container>
      <Spacer />
      <Button title="Send" onPress={onPress} />
    </Container>
  );
};
