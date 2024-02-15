// @refresh reset
import React, {useEffect} from 'react';

import {Keyboard, KeyboardEventListener, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {createTheme} from '@app/helpers';
import {IS_ANDROID, IS_IOS} from '@app/variables/common';

import {Web3BrowserProps} from './web3-browser';

export function WebViewContainer({
  children,
  webviewRef,
}: {
  webviewRef: Web3BrowserProps['webviewRef'];
  children: any;
}) {
  useEffect(() => {
    if (IS_IOS) {
      return;
    }

    const hide = () => {
      webviewRef.current?.injectJavaScript(
        'document.querySelectorAll("#keyboard-div").forEach(el => el.remove());true;',
      );
    };

    const show: KeyboardEventListener = ({endCoordinates}) => {
      hide();
      // injects div to implement keyboard avoid
      webviewRef.current?.injectJavaScript(`
          var keyboardDiv = document.createElement('div');
          keyboardDiv.style = "width: 100vw; height: ${endCoordinates.height}px;";
          keyboardDiv.setAttribute('id', 'keyboard-div');
          document.body.appendChild(keyboardDiv);
          true;
        `);
    };

    Keyboard.addListener('keyboardDidShow', show);
    Keyboard.addListener('keyboardDidHide', hide);

    () => {
      Keyboard.removeAllListeners('keyboardDidShow');
      Keyboard.removeAllListeners('keyboardDidHide');
    };
  }, [webviewRef.current]);

  if (IS_IOS) {
    return (
      <KeyboardAwareScrollView
        bounces={false}
        contentContainerStyle={styles.webviewContainer}>
        {children}
      </KeyboardAwareScrollView>
    );
  }

  if (IS_ANDROID) {
    return <View style={styles.webviewContainer}>{children}</View>;
  }
}

const styles = createTheme({
  webviewContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
