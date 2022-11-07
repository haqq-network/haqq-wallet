import React, {useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {
  Button,
  ButtonVariant,
  CloseCircle,
  IconButton,
  Input,
  KeyboardSafeArea,
} from '../components/ui';
import {StyleSheet, View} from 'react-native';
import {useWallet} from '../contexts/wallets';
import {GRAPHIC_BASE_2} from '../variables';

export const EditAccountNameScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'editAccountName'>>();

  const wallet = useWallet(route.params.address);
  const [inputName, setInputName] = useState(wallet?.name || '');

  const onSubmit = () => {
    if (wallet) {
      wallet.name = inputName;
    }
    navigation.goBack();
  };

  const onChange = (e: string) => {
    setInputName(e);
  };

  const cleanTextFile = () => {
    setInputName('');
  };

  return (
    <KeyboardSafeArea>
      <View style={page.container}>
        <Input
          onChangeText={onChange}
          label="Name"
          value={inputName}
          rightAction={
            inputName && (
              <IconButton onPress={cleanTextFile}>
                <CloseCircle color={GRAPHIC_BASE_2} style={page.icon} />
              </IconButton>
            )
          }
        />
        <View style={page.buttonContainer}>
          <Button
            title="Save"
            onPress={onSubmit}
            variant={ButtonVariant.contained}
          />
        </View>
      </View>
    </KeyboardSafeArea>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 12,
  },
  icon: {width: 20, height: 20},
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
});
