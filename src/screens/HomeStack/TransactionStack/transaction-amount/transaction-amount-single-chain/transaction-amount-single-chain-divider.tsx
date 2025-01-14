import {View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconsName} from '@app/components/ui';
import {createTheme} from '@app/helpers';

export const TransactionAmountSingleChainDivider = () => {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <View style={styles.arrowContainer}>
        <Icon
          i12
          name={IconsName.arrow_down_tail}
          color={Color.graphicSecond1}
        />
      </View>
      <View style={styles.divider} />
    </View>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    flex: 1,
    backgroundColor: Color.graphicSecond1,
  },
});
