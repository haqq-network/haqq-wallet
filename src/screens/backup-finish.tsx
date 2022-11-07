import React, {useMemo} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Dimensions} from 'react-native';

import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '../components/ui';
import {createTheme} from '../helpers/create-theme';
import {useTheme} from '../hooks/use-theme';
import {AppTheme, RootStackParamList} from '../types';

const animationSize = Dimensions.get('window').width - 116;

export const BackupFinishScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const animation = useMemo(() => {
    if (theme === AppTheme.dark) {
      return require('../../assets/animations/backup-success-animation-dark.json');
    }

    return require('../../assets/animations/backup-success-animation-light.json');
  }, [theme]);

  return (
    <PopupContainer style={page.popupContainer}>
      <Spacer style={page.container}>
        <LottieWrap
          source={animation}
          autoPlay
          loop={false}
          style={{width: animationSize, height: animationSize}}
        />
      </Spacer>
      <Text t4 style={page.title0}>
        Congratulations!
      </Text>
      <Text t4 style={page.title}>
        You've successfully protected your wallet.
      </Text>
      <Button
        style={page.button}
        variant={ButtonVariant.contained}
        title="Finish"
        onPress={() => {
          navigation.getParent()?.goBack();
        }}
      />
    </PopupContainer>
  );
};

const page = createTheme({
  popupContainer: {marginHorizontal: 20},
  container: {justifyContent: 'center', alignItems: 'center'},
  title: {marginBottom: 40, textAlign: 'center'},
  title0: {textAlign: 'center'},
  button: {marginVertical: 16},
});
