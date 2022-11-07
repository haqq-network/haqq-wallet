import React, {useMemo} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {Color, getColor} from '../colors';
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
import {createTheme} from '../helpers/create-theme';
import {useTheme} from '../hooks/use-theme';
import {AppTheme, RootStackParamList} from '../types';

export const BackupWarningScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'backupWarning'>>();
  const theme = useTheme();
  const animation = useMemo(() => {
    if (theme === AppTheme.dark) {
      return require('../../assets/animations/recover-animation-dark.json');
    }

    return require('../../assets/animations/recover-animation-light.json');
  }, [theme]);

  return (
    <PopupContainer style={page.container}>
      <Spacer style={page.imageContainer}>
        <LottieWrap source={animation} style={page.image} autoPlay loop />
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
        icon={<Alert color={getColor(Color.textYellow1)} />}>
        If you lose your recovery phrase, you will be unable to access your
        funds, as nobody will be able to restore it.
      </InfoBlock>
      <InfoBlock
        type={InfoBlockType.warning}
        style={page.infoBlock2}
        icon={<Alert color={getColor(Color.textYellow1)} />}>
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

const page = createTheme({
  container: {
    paddingHorizontal: 20,
  },
  imageContainer: {justifyContent: 'center', alignItems: 'center'},
  image: {width: 200, height: 200},
  title: {marginBottom: 4, textAlign: 'center'},
  paragraph: {
    marginBottom: 20,
    textAlign: 'center',
    color: Color.textBase2,
  },
  infoBlock1: {marginBottom: 20},
  infoBlock2: {marginBottom: 34},
  submit: {marginVertical: 16},
});
