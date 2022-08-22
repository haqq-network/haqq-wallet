import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, ButtonVariant, Title} from '../components/ui';
import {Container} from '../components/container';
import {Spacer} from '../components/spacer';

type BackupFinishScreenProp = CompositeScreenProps<any, any>;

export const BackupFinishScreen = ({navigation}: BackupFinishScreenProp) => {
  return (
    <Container>
      <Spacer />
      <Title>Сongratulations!</Title>
      <Title style={{marginBottom: 56}}>
        You've successfully protected your wallet.
      </Title>
      <Button
        style={{marginBottom: 16}}
        variant={ButtonVariant.contained}
        title="Finish"
        onPress={() => {
          navigation.getParent()?.goBack();
        }}
      />
    </Container>
  );
};
