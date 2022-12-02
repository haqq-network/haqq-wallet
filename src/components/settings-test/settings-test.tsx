import React, {useCallback, useEffect, useRef, useState} from 'react';

import {View} from 'react-native';

import {Button, ButtonVariant, Input, Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {Cosmos} from '@app/services/cosmos';
import {WEI} from '@app/variables';
import { I18N } from '@app/i18n';
import { cleanNumber } from '@app/utils';

// const sourceEthAddress = '0x866e2B80Cc5b887C571f98199C1beCa15FF82084';
const sourceEthAddress = '0x6e03A60fdf8954B4c10695292Baf5C4bdC34584B';

export const SettingsTest = () => {
  const live = useRef(true);
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const [amount, setAmount] = useState('0.001');
  const [staked, setStaked] = useState(0);
  const [reward, setReward] = useState(0);
  const [unbounded, setUnbounded] = useState(0);

  const [address, setAddress] = useState(
    'haqqvaloper175gdzz9l0tuw83e3trh3zq2p435fkge27rxarf',
  );

  useEffect(() => {
    return () => {
      live.current = false;
    };
  }, []);

  useEffect(() => {
    const sourceAddress = Cosmos.address(sourceEthAddress);

    cosmos
      .getAccountDelegations(sourceAddress)
      .then(resp => {
        const r = resp.delegation_responses.reduce((memo, delegate) => {
          return memo + parseInt(delegate.balance.amount, 10) / WEI;
        }, 0);
        setStaked(r);
      })
      .catch(e => {
        console.log('e', e);
      });

    cosmos.getAccountRewardsInfo(sourceAddress).then(resp => {
      const r = resp.total.reduce((memo, curr) => {
        return memo + parseInt(curr.amount, 10) / WEI;
      }, 0);

      setReward(r);
    });

    cosmos.getAccountUnDelegations(sourceAddress).then(resp => {
      const r = resp.entries.reduce((memo, entry) => {
        return memo + parseInt(entry.balance, 10) / WEI;
      }, 0);

      setUnbounded(r);
    });
  }, [cosmos]);

  const onPressDelegate = useCallback(async () => {
    const resp = await cosmos.delegate(
      sourceEthAddress,
      address,
      parseFloat(amount),
    );

    console.log('resp', resp);
  }, [address, amount, cosmos]);

  const onPressUnDelegate = useCallback(async () => {
    const resp = await cosmos.unDelegate(
      sourceEthAddress,
      address,
      parseFloat(amount),
    );

    console.log('resp', resp);
  }, [address, amount, cosmos]);

  return (
    <View style={styles.container}>
      <Text
        i18n={I18N.settingsTestStaked}
        i18params={{staked: cleanNumber(staked)}}
      />
      <Text
        i18n={I18N.settingsTestReward}
        i18params={{reward: cleanNumber(reward)}}
      />
      <Text 
        clean 
        style={styles.gap}
        i18n={I18N.settingsTestUnbounded}
        i18params={{unbounded: cleanNumber(unbounded)}}
      />
      <Input
        style={styles.gap}
        label={"delegate"}
        value={address}
        onChangeText={val => setAddress(val)}
        multiline
      />

      <Input
        style={styles.gap}
        label="amount"
        value={amount}
        onChangeText={val => setAmount(val)}
      />
      <View style={styles.buttons}>
        <Button
          i18n={I18N.settingsTestDelegate}
          style={styles.btn}
          onPress={onPressDelegate}
          variant={ButtonVariant.contained}
        />
        <Button
          i18n={I18N.settingsTestUndelegate}
          style={styles.btn}
          onPress={onPressUnDelegate}
          variant={ButtonVariant.second}
        />
      </View>
    </View>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
  gap: {
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  btn: {
    flex: 1,
    marginHorizontal: 8,
  },
});
