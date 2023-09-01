import React, {memo, useEffect, useState} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Text, Waiting} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type SplashModalProps = {};

const DESCRIPTION_TIMEOUT_MS = 10_000;

export const SplashModal = memo(({}: SplashModalProps) => {
  const [showDescription, setShowDescription] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDescription(true);
    }, DESCRIPTION_TIMEOUT_MS);

    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    <View style={styles.container}>
      <Waiting />
      {showDescription && (
        <Text
          t10
          i18n={I18N.splashDescription}
          style={styles.description}
          color={Color.textBase3}
        />
      )}
    </View>
  );
});

const styles = createTheme({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.graphicGreen2,
  },
  description: {
    position: 'absolute',
    bottom: 40,
    textAlign: 'center',
  },
});
