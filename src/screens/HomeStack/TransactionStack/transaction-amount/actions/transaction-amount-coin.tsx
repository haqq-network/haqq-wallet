import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Provider} from '@app/models/provider';

import {ActionsContainer} from './actions-container';
import {TransactionAmountCoinProps} from './actions.types';

export const TransactionAmountCoin = ({asset}: TransactionAmountCoinProps) => {
  if (!asset) {
    return null;
  }

  const providerIcon = Provider.getByEthChainId(asset.chain_id)?.icon;
  const providerIconSource = providerIcon ? {uri: providerIcon} : undefined;

  return (
    <ActionsContainer>
      <View style={styles.imageContainer}>
        <Image source={asset.image} style={styles.image} />
        <Image source={providerIconSource} style={styles.icon} />
      </View>
      <Text variant={TextVariant.t9} style={styles.coinName}>
        {asset.symbol}
      </Text>
    </ActionsContainer>
  );
};

const styles = createTheme({
  imageContainer: {
    position: 'absolute',
  },
  image: {
    width: 38,
    height: 38,
  },
  icon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Color.bg1,
    position: 'absolute',
    top: 0,
    right: -7,
  },
  coinName: {
    marginLeft: 38,
  },
});
