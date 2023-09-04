import React, {useCallback, useState} from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {DataContent, Icon} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N} from '@app/i18n';
import {Indexer} from '@app/services/indexer';
import {OnTransactionRowPress, TransactionListContract} from '@app/types';

export type TransactionPreviewProps = {
  item: TransactionListContract;
  onPress: OnTransactionRowPress;
};

export const TransactionContract = ({
  item,
  onPress,
}: TransactionPreviewProps) => {
  const [contractName, setContractName] = useState('');

  useEffectAsync(async () => {
    const name = await Indexer.instance.getContractName(item.to);
    setContractName(name);
  }, []);

  const handlePress = useCallback(() => {
    onPress(item.hash, {contractName});
  }, [item.hash, onPress, contractName]);

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon name="contract" color={Color.graphicBase1} />
        </View>
        <DataContent
          style={styles.infoContainer}
          titleI18n={I18N.transactionContractTitle}
          subtitleI18n={I18N.transactionContractNamePrefix}
          subtitleI18nParams={{
            value: contractName,
          }}
          short
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
  container: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    backgroundColor: Color.bg3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
