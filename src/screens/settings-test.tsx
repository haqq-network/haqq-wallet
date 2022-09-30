import React from 'react';
import {Button, Container} from '../components/ui';
import {HapticEffects, vibrate} from '../services/haptic';

export const SettingsTestScreen = () => {
  return (
    <Container>
      <Button
        title="Selection"
        onPress={() => {
          vibrate(HapticEffects.selection);
        }}
      />
      <Button
        title="Success"
        onPress={() => {
          vibrate(HapticEffects.success);
        }}
      />
      <Button
        title="Warning"
        onPress={() => {
          vibrate(HapticEffects.warning);
        }}
      />
      <Button
        title="Error"
        onPress={() => {
          vibrate(HapticEffects.error);
        }}
      />
    </Container>
  );
};
