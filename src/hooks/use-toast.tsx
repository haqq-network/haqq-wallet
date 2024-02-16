import React from 'react';

import Toast, {
  BaseToastProps,
  ErrorToast,
  ToastConfig,
} from 'react-native-toast-message';

import {Color} from '@app/colors';
import {ModalProvider} from '@app/components/modal-provider';
import {createTheme} from '@app/helpers';

const toastConfig: ToastConfig = {
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      contentContainerStyle={styles.toast}
      text1Style={styles.text}
      text2Style={styles.text}
    />
  ),
};

export const useToast = () => {
  return (
    <ModalProvider>
      <Toast config={toastConfig} />
    </ModalProvider>
  );
};

const styles = createTheme({
  text: {
    color: Color.textBase1,
  },
  toast: {
    backgroundColor: Color.bg1,
  },
});
