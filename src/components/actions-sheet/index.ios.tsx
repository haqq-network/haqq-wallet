import React, {useEffect} from 'react';

import {ActionSheetIOS} from 'react-native';

import {ActionsSheetProps} from '.';
import {I18N, getText} from '../../i18n';

export const ActionsSheet = ({
  onPressDiscard,
  onPressKeepEditing,
}: ActionsSheetProps) => {
  useEffect(() => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [
          getText(I18N.actionSheetKeepEditing),
          getText(I18N.actionSheetDiscard),
        ],
        title: getText(I18N.actionSheetMessage),
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          onPressKeepEditing?.();
        } else if (buttonIndex === 1) {
          onPressDiscard?.();
        }
      },
    );
  }, [onPressKeepEditing, onPressDiscard]);
  return <></>;
};
