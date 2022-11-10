import React, {useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleSheet, View} from 'react-native';

import {ActionsSheet} from '../components/actions-sheet';
import {CustomHeader} from '../components/custom-header';
import {Icon, IconButton, Input, KeyboardSafeArea} from '../components/ui';
import {useWallet} from '../contexts/wallets';
import {RootStackParamList} from '../types';
import {GRAPHIC_BASE_2, TEXT_GREEN_1} from '../variables';

export const SettingsAccountEditScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {address} =
    useRoute<RouteProp<RootStackParamList, 'settingsAccountEdit'>>().params;

  const wallet = useWallet(address);
  const [inputName, setInputName] = useState(wallet?.name || '');
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const isChanged = inputName !== wallet?.name;

  const onPressLeft = () => {
    if (isChanged) {
      setActionSheetVisible(true);
    } else {
      navigation.goBack();
    }
  };
  const onPressRight = () => {
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
  const onPressDiscard = () => {
    setActionSheetVisible(false);
    navigation.goBack();
  };

  const onPressKeepEditing = () => setActionSheetVisible(false);

  return (
    <>
      <CustomHeader
        title="Edit account name"
        onPressLeft={onPressLeft}
        textLeft={'Cancel'}
        textRight={'Save'}
        disabledRight={!isChanged}
        onPressRight={onPressRight}
        textColorRight={TEXT_GREEN_1}
        textColorLeft={TEXT_GREEN_1}
      />
      <KeyboardSafeArea>
        <View style={page.container}>
          <Input
            onChangeText={onChange}
            label="Name"
            value={inputName}
            rightAction={
              inputName && (
                <IconButton onPress={cleanTextFile}>
                  <Icon s name="closeCircle" color={GRAPHIC_BASE_2} />
                </IconButton>
              )
            }
          />
        </View>
      </KeyboardSafeArea>
      {actionSheetVisible && (
        <ActionsSheet
          onPressKeepEditing={onPressKeepEditing}
          onPressDiscard={onPressDiscard}
        />
      )}
    </>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 12,
  },
});
