import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Alert,
  Button,
  ButtonVariant,
  InfoBlock,
  InfoBlockType,
  Paragraph,
  PopupContainer,
  Spacer,
  Title,
} from '../components/ui';
import {Image, StyleSheet} from 'react-native';
import {TEXT_YELLOW_1} from '../variables';

type BackupWarningScreenProp = CompositeScreenProps<any, any>;

const warningImage = require('../../assets/images/mnemonic-warning.png');

export const BackupWarningScreen = ({
  navigation,
  route,
}: BackupWarningScreenProp) => {
  return (
    <PopupContainer style={page.container}>
      <Spacer style={page.image}>
        <Image source={warningImage} />
      </Spacer>
      <Title style={page.title}>Important about backup</Title>
      <Paragraph style={page.paragraph}>
        A backup is a restoring phrase of 12 words. It is better to write down
        the phrase on paper and not keep it online.
      </Paragraph>
      <InfoBlock
        type={InfoBlockType.warning}
        style={page.infoBlock1}
        icon={<Alert color={TEXT_YELLOW_1} />}>
        If you lose your recovery phrase, you will be unable to access your
        funds, as nobody will be able to restore it.
      </InfoBlock>
      <InfoBlock
        type={InfoBlockType.warning}
        style={page.infoBlock2}
        icon={<Alert color={TEXT_YELLOW_1} />}>
        This phrase is your only chance to recover access to your funds if your
        usual device is unavailable to you.
      </InfoBlock>
      <Button
        variant={ButtonVariant.contained}
        style={page.submit}
        title="Understood"
        onPress={() =>
          navigation.navigate('backupCreate', {address: route.params.address})
        }
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  image: {justifyContent: 'center', alignItems: 'center'},
  title: {marginBottom: 4},
  paragraph: {marginBottom: 20, textAlign: 'center'},
  infoBlock1: {marginBottom: 20},
  infoBlock2: {marginBottom: 34},
  submit: {marginVertical: 16},
});
