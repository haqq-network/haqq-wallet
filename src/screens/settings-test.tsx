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
  const [reward, setReward] = useState(0);
  const [unbounded, setUnbounded] = useState(0);

  const [address, setAddress] = useState(
    'haqqvaloper155srwdpu6vs0kftz8cu0lxgmy5kqhe3q0sd6l3',
  );

  useEffect(() => {
    const sourceAddress = Cosmos.address(
      '0x6e03A60fdf8954B4c10695292Baf5C4bdC34584B',
    );

    cosmos
      .getAccountDelegations(sourceAddress)
      .then(resp => {
        const r = resp.delegation_responses.reduce((memo, delegate) => {
          return memo + parseInt(delegate.balance.amount, 10) / GWEI;
        }, 0);
        setStaked(r);
      })
      .catch(e => {
        console.log('e', e);
      });

    cosmos.getRewardsInfo(sourceAddress).then(resp => {
      const r = resp.total.reduce((memo, curr) => {
        return memo + parseInt(curr.amount, 10) / GWEI;
      }, 0);

      setReward(r);
    });

    cosmos.getUnDelegations(sourceAddress).then(resp => {
      const r = resp.entries.reduce((memo, entry) => {
        return memo + parseInt(entry.balance, 10) / GWEI;
      }, 0);

      setUnbounded(r);
    });
  }, [cosmos]);

  const onPress = useCallback(async () => {
    const resp = await cosmos.delegate(
      '0x6e03A60fdf8954B4c10695292Baf5C4bdC34584B',
      address,
      parseFloat(amount),
    );

    console.log('resp', resp);
  }, [address, amount, cosmos]);

  return (
    <View style={styles.container}>
      <Text>staked: {staked}</Text>
      <Text>reward: {reward}</Text>
      <Text>unbounded: {unbounded}</Text>
      <Input
        label="delegate"
        value={address}
        onChangeText={val => setAddress(val)}
        multiline
      />

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
