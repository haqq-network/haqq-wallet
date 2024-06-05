import {useCallback, useEffect, useState} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  TopTabNavigator,
  TopTabNavigatorVariant,
} from '@app/components/top-tab-navigator';
import {
  Button,
  ButtonVariant,
  Spacer,
  Text,
  TextField,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {EstimationVariant} from '@app/services/eth-network/types';

const TABS = [I18N.low, I18N.average, I18N.high, I18N.custom];
const INIT_TAB_INDEX = 2;

export const FeeSettingsScreen = () => {
  const {params} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.FeeSettings
  >();

  const [activeTabIndex, setActiveTabIndex] = useState(INIT_TAB_INDEX);

  const [gasLimit, setGasLimit] = useState('');
  const [maxBaseFee, setMaxBaseFee] = useState('');
  const [priorityFee, setPriorityFee] = useState('');
  const [expectedFee, setExpectedFee] = useState('');

  useEffect(() => {
    if (activeTabIndex !== 3) {
      switch (activeTabIndex) {
        case 0:
          estimate('low');
          break;
        case 1:
          estimate('average');
          break;
        case 2:
          estimate('high');
          break;
      }
    }
  }, [activeTabIndex]);

  const estimate = useCallback(
    async (txEstimationVariant: EstimationVariant) => {
      const data = await EthNetwork.estimate(txEstimationVariant, {
        from: params.from,
        to: params.to,
        value: params.amount,
      });
      setGasLimit(String(data.gasLimit.toWei()));
      setMaxBaseFee(String(data.maxBaseFee.toWei()));
      setPriorityFee(String(data.maxFeePerGas.toWei()));
      setExpectedFee(String(data.expectedFee.toBalanceString(6)));
    },
    [],
  );

  const onTabChange = useCallback((tabName: string) => {
    setActiveTabIndex(Number(tabName));
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.tabs}>
          <TopTabNavigator
            contentContainerStyle={styles.tabsContentContainerStyle}
            variant={TopTabNavigatorVariant.large}
            onTabChange={onTabChange}
            activeTabIndex={activeTabIndex}
            initialTabIndex={INIT_TAB_INDEX}>
            {TABS.map((tab, index) => (
              <TopTabNavigator.Tab
                key={getText(tab)}
                testID={`FeeSettings${getText(tab)}Tab`}
                name={String(index)}
                title={tab}
                component={null}
              />
            ))}
          </TopTabNavigator>
        </View>
        <TextField
          label={I18N.gasLimit}
          placeholder={I18N.empty}
          value={gasLimit}
          onChangeText={setGasLimit}
          editable={activeTabIndex === 3}
        />
        <Spacer height={24} />
        <TextField
          label={`${getText(I18N.gasPrice)} (aISLM)`}
          placeholder={I18N.empty}
          value={maxBaseFee}
          onChangeText={setMaxBaseFee}
          editable={activeTabIndex === 3}
        />
        <Spacer height={24} />
        <TextField
          label={I18N.adjustment}
          placeholder={I18N.empty}
          value={priorityFee}
          onChangeText={setPriorityFee}
          editable={activeTabIndex === 3}
        />
        <Spacer height={28} />
        <View style={styles.fee}>
          <Text variant={TextVariant.t11}>Expected Fee</Text>
          <Text variant={TextVariant.t11} color={Color.textBase2}>
            {expectedFee}
          </Text>
        </View>
      </View>
      <View>
        <Button variant={ButtonVariant.second} i18n={I18N.reset} />
        <Spacer height={16} />
        <Button variant={ButtonVariant.contained} i18n={I18N.apply} />
        <Spacer height={16} />
      </View>
    </View>
  );
};

const styles = createTheme({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  fee: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabs: {
    height: 64,
  },
  tabsContentContainerStyle: {
    flex: 1,
  },
});
