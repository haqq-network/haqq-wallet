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
import {I18N, getText} from '../i18n';
import {RootStackParamList} from '../types';
import {LIGHT_GRAPHIC_BASE_2} from '../variables';

export const TransactionContactEditScreen = () => {
  const {goBack} = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {name, address} =
    useRoute<RouteProp<RootStackParamList, 'transactionContactEdit'>>().params;

  const contacts = useContacts();
  const [inputName, setInputName] = useState(name);

  const onSubmit = () => {
    contacts.updateContact(address, inputName);
    goBack();
  };

  const onChange = (e: string) => {
    setInputName(e);
  };

  const cleanTextFile = () => setInputName('');

  return (
    <KeyboardSafeArea style={page.container}>
      <Input
        onChangeText={onChange}
        label={getText(I18N.name)}
        value={inputName}
        rightAction={
          inputName && (
            <IconButton onPress={cleanTextFile}>
              <Icon s name="close_circle" color={LIGHT_GRAPHIC_BASE_2} />
            </IconButton>
          )
        }
      />
      <View style={page.spaceInput} />
      <Input
        multiline
        label={getText(I18N.address)}
        editable={false}
        value={address}
      />
      <View style={page.buttonContainer}>
        <Button
          disabled={name === inputName}
          title={getText(I18N.continue)}
          onPress={onSubmit}
          variant={ButtonVariant.contained}
        />
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
