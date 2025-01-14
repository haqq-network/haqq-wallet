import {observer} from 'mobx-react';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {shortAddress} from '@app/helpers/short-address';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';

import {ActionsContainer} from './actions-container';

import {TransactionStore} from '../../transaction-store';

export const TransactionAmountTo = observer(() => {
  const {toAsset, toAddress} = TransactionStore;

  if (!toAsset) {
    return null;
  }

  const providerName =
    Provider.getByEthChainId(toAsset.chain_id)?.networkType ?? '';

  return (
    <ActionsContainer>
      <Text
        i18n={I18N.toProvider}
        variant={TextVariant.t14}
        color={Color.textBase2}
      />
      <Spacer width={4} />
      <Text variant={TextVariant.t9}>
        {shortAddress(toAddress, '•', false, 1)}
      </Text>
      <Spacer width={4} />
      <Text
        i18n={I18N.onProvider}
        variant={TextVariant.t14}
        color={Color.textBase2}
      />
      <Spacer width={4} />
      <Text variant={TextVariant.t9}>{providerName.toUpperCase()}</Text>
    </ActionsContainer>
  );
});
