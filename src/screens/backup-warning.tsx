import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Container} from '../components/container';
import {
  Alert,
  Button,
  ButtonVariant,
  InfoBlock,
  InfoBlockType,
  Paragraph,
  Title,
} from '../components/ui';
import {Spacer} from '../components/spacer';
import {Image} from 'react-native';
import {TEXT_YELLOW_1} from '../variables';

type BackupWarningScreenProp = CompositeScreenProps<any, any>;

const warningImage = require('../../assets/images/mnemonic-warning.png');

export const BackupWarningScreen = ({
  navigation,
  route,
}: BackupWarningScreenProp) => {
  return (
    <Container>
      <Spacer style={{justifyContent: 'center', alignItems: 'center'}}>
        <Image source={warningImage} />
      </Spacer>
      <Title style={{marginBottom: 4}}>Important about backup</Title>
      <Paragraph style={{marginBottom: 20, textAlign: 'center'}}>
        A backup is a restoring phrase of 12 words. It is better to write down
        the phrase on paper and not keep it online.
      </Paragraph>
      <InfoBlock
        type={InfoBlockType.warning}
        style={{marginBottom: 20}}
        icon={<Alert color={TEXT_YELLOW_1} />}>
        If you lose your recovery phrase, you will be unable to access your
        funds, as nobody will be able to restore it.
      </InfoBlock>
      <InfoBlock
        type={InfoBlockType.warning}
        style={{marginBottom: 50}}
        icon={<Alert color={TEXT_YELLOW_1} />}>
        This phrase is your only chance to recover access to your funds if your
        usual device is unavailable to you.
      </InfoBlock>
      <Button
        variant={ButtonVariant.contained}
        title="Understood"
        onPress={() =>
          navigation.navigate('backupCreate', {address: route.params.address})
        }
      />
    </Container>
  );
};
