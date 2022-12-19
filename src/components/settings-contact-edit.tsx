import React, {useState} from 'react';

import {Color} from '@app/colors';
import {ActionsSheet} from '@app/components/actions-sheet';
import {SettingsAddressBookEdit} from '@app/components/settings-address-book-edit';
import {CustomHeader} from '@app/components/ui';
import {I18N} from '@app/i18n';

type SettingsContactEditProps = {
  address: string;
  name: string;
  actionSheetVisible: boolean;
  isCreate: boolean | undefined;
  onRemove: () => void;
  onSubmit: (value?: string) => void;
  onPressDiscard: () => void;
  goBack: () => void;
  setInputName: React.Dispatch<React.SetStateAction<string>>;
  setActionSheetVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SettingsContactEdit = ({
  address,
  name,
  isCreate,
  actionSheetVisible,
  onRemove,
  onSubmit,
  onPressDiscard,
  goBack,
  setActionSheetVisible,
}: SettingsContactEditProps) => {
  const [inputName, setInputName] = useState(name);
  const [isEdit, setIsEdit] = useState(!!isCreate);

  const isChanged = inputName !== name;

  const onPressRight = () => {
    if (!isEdit) {
      setIsEdit(true);
    } else {
      onSubmit(inputName);
    }
  };

  const onPressLeft = () => {
    if (!isEdit) {
      goBack();
    } else if (isChanged) {
      setActionSheetVisible(true);
    } else {
      goBack();
    }
  };

  const onChangeAddress = (text: string) => {
    setInputName(text);
  };

  const onPressKeepEditing = () => setActionSheetVisible(false);

  return (
    <>
      <CustomHeader
        i18nTitle={I18N.settingsContactEditHeaderTitle}
        onPressLeft={onPressLeft}
        iconLeft={isEdit ? undefined : 'arrow_back'}
        i18nTextLeft={I18N.cancel}
        i18nTextRight={isEdit ? I18N.save : I18N.edit}
        disabledRight={!isChanged && isEdit}
        onPressRight={onPressRight}
        colorRight={Color.graphicGreen1}
        colorLeft={Color.graphicGreen1}
      />
      <SettingsAddressBookEdit
        onSubmit={onSubmit}
        onRemove={onRemove}
        buttonType="del"
        isEdit={isEdit}
        isCreate={isCreate}
        onChangeAddress={onChangeAddress}
        initAddress={address}
        initName={name}
      />
      {actionSheetVisible && (
        <ActionsSheet
          onPressKeepEditing={onPressKeepEditing}
          onPressDiscard={onPressDiscard}
        />
      )}
    </>
  );
};
