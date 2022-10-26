import {DismissPopupButton} from '../components/dismiss-popup-button';
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
