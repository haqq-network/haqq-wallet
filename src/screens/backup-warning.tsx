import React from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleSheet} from 'react-native';

import {
  Alert,
  Button,
  ButtonVariant,
  InfoBlock,
  InfoBlockType,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '../components/ui';
import {RootStackParamList} from '../types';
import {TEXT_BASE_2, TEXT_YELLOW_1} from '../variables';

const warningImage = require('../../assets/animations/recover-animation.json');

export const BackupWarningScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'backupWarning'>>();
  return (
    <PopupContainer style={page.container}>
      <Spacer style={page.imageContainer}>
        <LottieWrap source={warningImage} style={page.image} autoPlay loop />
      </Spacer>
      <Text t4 style={page.title}>
        Important about backup
      </Text>
      <Text t11 style={page.paragraph}>
        A backup is a restoring phrase of 12 words. It is better to write down
        the phrase on paper and not keep it online.
      </Text>
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
  imageContainer: {justifyContent: 'center', alignItems: 'center'},
  image: {width: 200, height: 200},
  title: {marginBottom: 4, textAlign: 'center'},
  paragraph: {marginBottom: 20, textAlign: 'center', color: TEXT_BASE_2},
  infoBlock1: {marginBottom: 20},
  infoBlock2: {marginBottom: 34},
  submit: {marginVertical: 16},
});
