import {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';

import {Color} from '@app/colors';
import {LabeledBlock, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';

import {TransactionStore} from '../transaction-store';

export const TransactionAddressNetwork = observer(() => {
  const {toChainId} = TransactionStore;

  const navigation = useTypedNavigation<TransactionStackParamList>();

  const selectedProviderName = useMemo(() => {
    if (!toChainId) {
      return '-';
    }

    return Provider.getByEthChainId(toChainId)?.name ?? '';
  }, [toChainId]);

  const onNetworkPress = useCallback(async () => {
    navigation.navigate(TransactionStackRoutes.TransactionNetworkSelect);
  }, []);

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
