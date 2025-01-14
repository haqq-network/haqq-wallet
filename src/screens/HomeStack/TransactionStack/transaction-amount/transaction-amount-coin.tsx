import {View} from 'react-native';

import {createTheme} from '@app/helpers';

export const TransactionAmountCoin = () => {
  return <View style={styles.container} />;
};

const styles = createTheme({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
