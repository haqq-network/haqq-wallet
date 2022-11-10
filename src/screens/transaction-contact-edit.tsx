import React, {useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleSheet, View} from 'react-native';

import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  Input,
  KeyboardSafeArea,
} from '../components/ui';
import {useContacts} from '../contexts/contacts';
import {RootStackParamList} from '../types';
import {LIGHT_GRAPHIC_BASE_2} from '../variables';

export const TransactionEditContactScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {name, address} =
    useRoute<RouteProp<RootStackParamList, 'transactionEditContact'>>().params;

  const contacts = useContacts();
  const [inputName, setInputName] = useState(name);

  const onSubmit = () => {
    contacts.updateContact(address, inputName);
    navigation.goBack();
  };

  const onChange = (e: string) => {
    setInputName(e);
  };

  const cleanTextFile = () => setInputName('');

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
                <Icon s name="closeCircle" color={LIGHT_GRAPHIC_BASE_2} />
              </IconButton>
            )
          }
        />
        <View style={page.spaceInput} />
        <Input multiline label="Address" editable={false} value={address} />
        <View style={page.buttonContainer}>
          <Button
            disabled={name === inputName}
            title="Continue"
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
  spaceInput: {height: 24},
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
});
