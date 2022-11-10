import React, {useEffect, useState} from 'react';

import {StyleSheet, View} from 'react-native';

import {EthNetwork} from '../../services/eth-network';
import {cleanNumber, shortAddress} from '../../utils';
import {Button, ButtonSize, ButtonVariant, DataContent} from '../ui';

export type LedgerAccountsRowProps = {
  item: string;
  wallets: string[];
  onPress: (item: string) => void;
};

export const LedgerAccountsRow = ({
  item,
  onPress,
  wallets,
}: LedgerAccountsRowProps) => {
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
        title={`${cleanNumber(balance.toFixed(8))} ISML`}
        subtitle={shortAddress(item)}
      />
      {wallets.includes(item) ? (
        <Button
          disabled
          variant={ButtonVariant.second}
          size={ButtonSize.small}
          title="Added"
          onPress={onPressButton}
        />
      ) : (
        <Button
          variant={ButtonVariant.second}
          size={ButtonSize.small}
          title="Add"
          onPress={onPressButton}
        />
      )}
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
