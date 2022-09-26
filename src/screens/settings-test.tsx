import React from 'react';
import {Button, Container} from '../components/ui';
import {useApp} from '../contexts/app';

export const SettingsTestScreen = () => {
  const app = useApp();
  return (
    <Container>
      <Button
        title="Test"
        onPress={() => {
          app.emit('notification', 'test message');
        }}
      />
    </Container>
  );
};
