import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';

import {ActionsContainer} from './actions-container';

import {TransactionStore} from '../../transaction-store';

export const TransactionAmountFrom = () => {
  const {fromAsset} = TransactionStore;

  if (!fromAsset) {
    return null;
  }

  const providerName =
    Provider.getByEthChainId(fromAsset.chain_id)?.networkType ?? '';

  return (
    <ActionsContainer>
      <Text
        i18n={I18N.fromProvider}
        variant={TextVariant.t14}
        color={Color.textBase2}
      />
      <Spacer width={4} />
      <Text variant={TextVariant.t9}>{providerName.toUpperCase()}</Text>
    </ActionsContainer>
  );
};
