import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {PopupHeader} from '@app/components/popup-header';

import {ActionSheetType} from '../types';

export const actionSheet: ActionSheetType = {
  presentation: 'transparentModal',
  animation: 'fade',
  animationDuration: 0,
  animationEnabled: true,
};

export const hideBack = {
  headerLeft: () => null,
  headerRight: DismissPopupButton,
};

export const modalWithoutBack = {
  ...hideBack,
  presentation: 'modal',
};

export const popupScreenOptions = {
  header: PopupHeader,
  gestureEnabled: false,
};
