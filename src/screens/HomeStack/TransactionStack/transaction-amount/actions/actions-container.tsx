import {PropsWithChildren} from 'react';

import {TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

export const ActionsContainer = ({children}: PropsWithChildren) => {
  return (
    <TouchableOpacity>
      <View style={styles.container}>{children}</View>
    </TouchableOpacity>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Color.bg8,
  },
});
