import {Dimensions, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconsName, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';

import {TransactionAmountCrossChaimSwapProviderList} from './transaction-amount-cross-chain-swap-provider-list';

export const TransactionAmountCrossChainDivider = () => {
  return (
    <View style={styles.container}>
      <View style={styles.arrowContainer}>
        <Icon
          i12
          name={IconsName.arrow_down_tail}
          color={Color.graphicSecond1}
        />
      </View>
      <Spacer width={8} />
      <TransactionAmountCrossChaimSwapProviderList />
      <View style={styles.divider} />
    </View>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  arrowContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    marginLeft: 24,
    height: 1,
    flex: 1,
    position: 'absolute',
    left: 0,
    // Calculate based on horizontal padding 20 and margin left 24
    width: Dimensions.get('screen').width - 64,
    zIndex: -1,
    backgroundColor: Color.graphicSecond1,
  },
});
