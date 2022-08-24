import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, ButtonVariant, Title} from '../components/ui';
import {Container} from '../components/container';
import {Spacer} from '../components/spacer';

type TransactionFinishScreenProp = CompositeScreenProps<any, any>;

export const TransactionFinishScreen = ({
  navigation,
}: TransactionFinishScreenProp) => {
  return (
    <Container>
      <Spacer />
      <Title style={{marginBottom: 76}}>Congratulations!</Title>
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
