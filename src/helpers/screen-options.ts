import {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {PopupHeader} from '@app/components/popup-header';

import {ActionSheetType} from '../types';

export const actionSheet: ActionSheetType = {
  presentation: 'transparentModal',
  animation: 'fade',
  animationDuration: 0,
  animationEnabled: true,
};

export const popupScreenOptions = {
  header: PopupHeader,
  gestureEnabled: false,
};

export const popupScreenOptionsWithMargin: NativeStackNavigationOptions = {
  header: PopupHeader,
  gestureEnabled: false,
  // TODO: hasNotch
  //@ts-ignore
  headerStyle: {marginTop: Platform.OS === 'ios' ? 48 : 14},
};

export const hideBack: NativeStackNavigationOptions = {
  headerLeft: () => null,
  headerRight: DismissPopupButton,
};

export const hideHeader: NativeStackNavigationOptions = {
  headerShown: false,
};

export const modalWithoutBack = {
  ...hideBack,
  presentation: 'modal',
};
