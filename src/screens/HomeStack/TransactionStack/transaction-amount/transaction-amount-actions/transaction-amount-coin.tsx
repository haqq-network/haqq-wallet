import {TokenIcon} from '@app/components';
import {Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';

import {ActionsContainer} from './actions-container';
import {TransactionAmountCoinProps} from './actions.types';

export const TransactionAmountCoin = ({asset}: TransactionAmountCoinProps) => {
  if (!asset) {
    return null;
  }

  return (
    <ActionsContainer>
      <TokenIcon asset={asset} width={38} height={38} />
      <Text variant={TextVariant.t9} style={styles.coinName}>
        {asset.symbol}
      </Text>
    </ActionsContainer>
  );
};

const styles = createTheme({
  coinName: {
    marginLeft: 38,
  },
});
