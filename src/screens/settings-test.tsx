import React, {useCallback, useEffect, useRef, useState} from 'react';

import {View} from 'react-native';

import {Button, Input, Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {Cosmos} from '@app/services/cosmos';
import {GWEI} from '@app/variables';

export const SettingsTestScreen = () => {
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const [amount, setAmount] = useState('0.001');
  const [staked, setStaked] = useState(0);

  useEffect(() => {
    const address = Cosmos.address(
      '0x6e03A60fdf8954B4c10695292Baf5C4bdC34584B',
    );

    cosmos
      .getAccountDelegations(address)
      .then(resp => {
        const r = resp.delegation_responses.reduce((memo, delegate) => {
          return memo + parseInt(delegate.balance.amount, 10) / GWEI;
        }, 0);
        setStaked(r);
      })
      .catch(e => {
        console.log('e', e);
      });
  }, [cosmos]);

  const onPress = useCallback(async () => {
    const resp = await cosmos.delegate(
      '0x6e03A60fdf8954B4c10695292Baf5C4bdC34584B',
      'haqqvaloper17c6sm68sfeuyxle5tswa28lcv4u8cvt2fx8mvz',
      parseFloat(amount),
    );

    console.log('resp', resp);
  }, [amount, cosmos]);

  return (
    <View style={styles.container}>
      <Text>staked: {staked}</Text>
      <Input
        label="amount"
        value={amount}
        onChangeText={val => setAmount(val)}
      />
      <Button title="delegate" onPress={onPress} />
    </View>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
