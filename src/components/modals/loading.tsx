import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Text, Waiting} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useAndroidSystemColors} from '@app/hooks';
import {Modals} from '@app/types';

export const LoadingModal = ({text}: Modals['loading']) => {
  useAndroidSystemColors();

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

const styles = createTheme({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: Color.graphicGreen2,
  },
  text: {width: 230},
  waiting: {marginBottom: 40},
});
