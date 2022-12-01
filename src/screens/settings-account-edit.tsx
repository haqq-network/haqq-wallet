import React, {useState} from 'react';

import {SettingsAccountEdit} from '@app/components/settings-account-edit';
import {useWallet} from '@app/hooks';
import {useTypedNavigation} from '@app/hooks/use-typed-navigation';
import {useTypedRoute} from '@app/hooks/use-typed-route';

export const SettingsAccountEditScreen = () => {
  const navigation = useTypedNavigation();
  const {address} = useTypedRoute<'settingsAccountEdit'>().params;

  const wallet = useWallet(address);
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
    </>
  );
};
