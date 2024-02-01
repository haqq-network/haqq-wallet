import React, {useState} from 'react';

import {observer} from 'mobx-react';

import {SettingsAccountEdit} from '@app/components/settings-account-edit';
import {useTypedNavigation} from '@app/hooks/use-typed-navigation';
import {useTypedRoute} from '@app/hooks/use-typed-route';
import {Wallet} from '@app/models/wallet';
import {
  ManageAccountsStackParamList,
  ManageAccountsStackRoutes,
} from '@app/route-types';

export const SettingsAccountEditScreen = observer(() => {
  const navigation = useTypedNavigation<ManageAccountsStackParamList>();
  const {address} = useTypedRoute<
    ManageAccountsStackParamList,
    ManageAccountsStackRoutes.SettingsAccountEdit
  >().params;

  const wallet = Wallet.getById(address);
  const [inputName, setInputName] = useState(wallet?.name ?? '');
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
      Wallet.update(wallet.address, {
        name: inputName,
      });
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
    <SettingsAccountEdit
      actionSheetVisible={actionSheetVisible}
      onPressLeft={onPressLeft}
      isChanged={isChanged}
      onPressRight={onPressRight}
      onChange={onChange}
      inputName={inputName}
      cleanTextFile={cleanTextFile}
      onPressKeepEditing={onPressKeepEditing}
      onPressDiscard={onPressDiscard}
    />
  );
});
