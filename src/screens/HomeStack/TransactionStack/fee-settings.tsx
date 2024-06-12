import {useCallback, useEffect, useState} from 'react';

import {BigNumber} from 'ethers';
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
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {
  CalculatedFees,
  EstimationVariant,
} from '@app/services/eth-network/types';

const TABS = [I18N.low, I18N.average, I18N.high, I18N.custom];
const INIT_TAB_INDEX = 1;

export const FeeSettingsScreen = () => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  const {params} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.FeeSettings
  >();

  const [activeTabIndex, setActiveTabIndex] = useState(INIT_TAB_INDEX);

  const [gasLimit, setGasLimit] = useState('');
  const [maxBaseFee, setMaxBaseFee] = useState('');
  const [priorityFee, setPriorityFee] = useState('');

  const [resetData, _setResetData] = useState<{
    calculatedFees: CalculatedFees;
    gasLimit: string;
    maxBaseFee: string;
    priorityFee: string;
  } | null>(null);
  const [calculatedFees, _setCalculatedFees] = useState<CalculatedFees | null>(
    null,
  );

  const setCalculatedFees = useCallback(
    (data: CalculatedFees) => {
      if (activeTabIndex !== 3) {
        _setResetData({
          calculatedFees: data,
          gasLimit,
          maxBaseFee,
          priorityFee,
        });
      }

      _setCalculatedFees(data);
    },
    [activeTabIndex, gasLimit, maxBaseFee, priorityFee],
  );

  const estimate = useCallback(
    async (txEstimationVariant: EstimationVariant) => {
      if (txEstimationVariant === 'custom') {
        const data = await EthNetwork.customEstimate(
          {
            from: params.from,
            to: params.to,
            value: params.amount,
          },
          {
            gasLimit: BigNumber.from(gasLimit),
            maxBaseFee: BigNumber.from(+maxBaseFee * Math.pow(10, 9)),
            maxPriorityFee: BigNumber.from(+priorityFee * Math.pow(10, 9)),
          },
        );

        setCalculatedFees(data);
      } else {
        const data = await EthNetwork.estimate(
          {
            from: params.from,
            to: params.to,
            value: params.amount,
          },
          txEstimationVariant,
        );
        setGasLimit(String(data.gasLimit.toWei()));
        setMaxBaseFee(String(data.maxBaseFee.toGWei()));
        setPriorityFee(String(data.maxPriorityFee.toGWei()));
        setCalculatedFees(data);
      }
    },
    [gasLimit, maxBaseFee, priorityFee],
  );

  const onTabChange = useCallback((tabName: string) => {
    setActiveTabIndex(Number(tabName));
  }, []);

  const handleApply = useCallback(() => {
    navigation.navigate(TransactionStackRoutes.TransactionConfirmation, {
      from: params.from,
      to: params.to,
      amount: params.amount,
      token: params.token,
      calculatedFees: calculatedFees ?? undefined,
    });
  }, [params, calculatedFees]);

  const handleReset = useCallback(() => {
    if (activeTabIndex === 3 && resetData) {
      _setCalculatedFees(resetData.calculatedFees);
      setGasLimit(resetData.gasLimit);
      setMaxBaseFee(resetData.maxBaseFee);
      setPriorityFee(resetData.priorityFee);
    }
  }, [activeTabIndex, resetData]);

  useEffect(() => {
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
      case 3:
        estimate('custom');
    }
  }, [activeTabIndex, estimate]);

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
          infoBlock={{
            label: getText(I18N.moreAbout, {item: getText(I18N.gasLimit)}),
            title: I18N.gasLimit,
            description: I18N.gasLimitDescription,
          }}
        />
        <Spacer height={24} />
        <TextField
          label={`${getText(I18N.maxBaseFee)} (GWei)`}
          placeholder={I18N.empty}
          value={maxBaseFee}
          onChangeText={setMaxBaseFee}
          editable={activeTabIndex === 3}
          infoBlock={{
            label: getText(I18N.moreAbout, {item: getText(I18N.maxBaseFee)}),
            title: I18N.maxBaseFee,
            description: I18N.maxBaseFeeDescription,
          }}
        />
        <Spacer height={24} />
        <TextField
          label={`${getText(I18N.maxPriorityFee)} (GWei)`}
          placeholder={I18N.empty}
          value={priorityFee}
          onChangeText={setPriorityFee}
          editable={activeTabIndex === 3}
          infoBlock={{
            label: getText(I18N.moreAbout, {
              item: getText(I18N.maxPriorityFee),
            }),
            title: I18N.maxPriorityFee,
            description: I18N.maxPriorityFeeDescription,
          }}
        />
        <Spacer height={28} />
        <View style={styles.fee}>
          <Text variant={TextVariant.t11}>Expected Fee</Text>
          <Text variant={TextVariant.t11} color={Color.textBase2}>
            {calculatedFees?.expectedFee.toBalanceString(6) ?? '-'}
          </Text>
        </View>
      </View>
      <View>
        <Button
          variant={ButtonVariant.second}
          i18n={I18N.reset}
          onPress={handleReset}
        />
        <Spacer height={16} />
        <Button
          variant={ButtonVariant.contained}
          i18n={I18N.apply}
          onPress={handleApply}
        />
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
