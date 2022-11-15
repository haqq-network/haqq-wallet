import {DismissPopupButton} from '@app/components/dismiss-popup-button';
import {PopupHeader} from '@app/components/popup-header';

import {ActionSheetType} from '../types';

export const actionSheet: ActionSheetType = {
  presentation: 'transparentModal',
  animation: 'fade',
  animationDuration: 0,
};

export const hideBack = {
  headerBackHidden: true,
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
