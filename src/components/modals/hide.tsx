import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {useAndroidSystemColors, useThematicStyles} from '@app/hooks';

export const HideModal = () => {
  useAndroidSystemColors();
  const styles = useThematicStyles(stylesObj);

  return (
    <View style={styles.container}>
      {/* <Icon i120 name="logo" color={Color.graphicBase3} /> */}
      <Text color={Color.textBase3} t2 center style={styles.text}>
        ISLM Wallet
      </Text>
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
  text: {
    marginHorizontal: 20,
    marginTop: 24,
  },
});
