import {DismissPopupButton} from '../components/dismiss-popup-button';
import {ActionSheetType} from '../types';
import {PopupHeader} from '../components/popup-header';

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
