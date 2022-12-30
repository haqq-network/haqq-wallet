import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Text, Waiting} from '@app/components/ui';
import {useAndroidSystemColors, useThematicStyles} from '@app/hooks';

export type LoadingModalProps = {
  text?: string;
};

export const LoadingModal = ({text}: LoadingModalProps) => {
  useAndroidSystemColors();
  const styles = useThematicStyles(stylesObj);
  return (
    <View style={styles.container}>
      <Waiting style={styles.waiting} />
      {text && (
        <Text t4 color={Color.textBase3} center style={styles.text}>
          {text}
        </Text>
      )}
    </View>
  );
};

const stylesObj = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: Color.graphicGreen2,
  },
  text: {width: 230},
  waiting: {marginBottom: 40},
});
