import {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';

import {Color} from '@app/colors';
import {LabeledBlock, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {awaitForProvider} from '@app/helpers/await-for-provider';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';

import {TransactionStore} from '../transaction-store';

export const TransactionAddressNetwork = observer(() => {
  const {toChainId} = TransactionStore;

  const selectedProviderName = useMemo(() => {
    if (!toChainId) {
      return '-';
    }

    return Provider.getByEthChainId(toChainId)?.name ?? '';
  }, [toChainId]);

  const onNetworkPress = useCallback(async () => {
    const providerId = await awaitForProvider({
      initialProviderChainId: toChainId,
      title: I18N.networks,
    });

    TransactionStore.toChainId = Provider.getById(providerId).ethChainId;
  }, [toChainId]);

  return (
    <LabeledBlock
      i18nLabel={I18N.transactionNetwork}
      style={styles.labeledBlock}
      onPress={onNetworkPress}>
      <Text
        variant={TextVariant.t11}
        color={Color.textBase1}
        numberOfLines={1}
        ellipsizeMode="tail">
        {selectedProviderName}
      </Text>
    </LabeledBlock>
  );
});

const styles = createTheme({
  labeledBlock: {
    alignItems: 'center',
    height: 58,
    width: 100,
  },
});
