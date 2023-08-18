import {StackNavigationOptions} from '@react-navigation/stack';

import {PopupHeader} from '@app/components';
import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {SpacerPopupButton} from '@app/components/popup/spacer-popup-button';
import {I18N, getText} from '@app/i18n';

export const getModalScreenOptions = (title?: I18N): StackNavigationOptions => {
  return {
    title: title ? getText(title) : undefined,
    headerShown: true,
    header: PopupHeader,
    headerLeft: SpacerPopupButton,
    headerRight: DismissPopupButton,
    presentation: 'modal',
  };
};
