import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, ButtonSize, ButtonVariant, DataContent} from '../ui';
import {EthNetwork} from '../../services/eth-network';
import {cleanNumber, shortAddress} from '../../utils';

export type LedgerAccountsRowProps = {
  item: string;
  onPress: (item: string) => void;
};

export const LedgerAccountsRow = ({item, onPress}: LedgerAccountsRowProps) => {
  const [balance, setBalance] = useState(0);

  const onPressButton = () => {
    onPress(item);
  };

  useEffect(() => {
    EthNetwork.getBalance(item).then(result => {
      setBalance(result);
    });
  }, [item]);

  return (
    <View style={styles.container}>
      <DataContent
        title={`${cleanNumber(balance)} ISML`}
        subtitle={shortAddress(item)}
      />
      <Button
        variant={ButtonVariant.second}
        size={ButtonSize.small}
        title="Add"
        onPress={onPressButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
