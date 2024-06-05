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
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N, getText} from '@app/i18n';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {CalculatedFees} from '@app/services/eth-network/types';

const TABS = [I18N.low, I18N.average, I18N.high, I18N.custom];
const INIT_TAB_INDEX = 2;

export const FeeSettingsScreen = () => {
  const {params} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.FeeSettings
  >();

  const [activeTabIndex, setActiveTabIndex] = useState(INIT_TAB_INDEX);
  const [feeData, setFeeData] = useState<CalculatedFees | null>(null);

  const [gasLimit, setGasLimit] = useState('');
  const [gasPrice, setGasPrice] = useState('');
  const [adjustment, setAdjustment] = useState('1');
  const [expectedFee, setExpectedFee] = useState('');

  useEffect(() => {
    if (feeData) {
      switch (activeTabIndex) {
        case 0:
          setGasLimit(String(feeData.gasLimit.toWei()));
          setGasPrice(String(feeData.gasPrice.low.toWei()));
          setExpectedFee(String(feeData.fee.low.toBalanceString(4)));
          break;
        case 1:
          setGasLimit(String(feeData.gasLimit.toWei()));
          setGasPrice(String(feeData.gasPrice.average.toWei()));
          setExpectedFee(String(feeData.fee.average.toBalanceString(4)));
          break;
        case 2:
          setGasLimit(String(feeData.gasLimit.toWei()));
          setGasPrice(String(feeData.gasPrice.high.toWei()));
          setExpectedFee(String(feeData.fee.high.toBalanceString(4)));
          break;
        default:
          setGasLimit('');
          setGasPrice('');
          setExpectedFee('');
      }
    }
  }, [feeData, activeTabIndex]);

  useEffectAsync(async () => {
    const data = await EthNetwork.estimate(
      params.from,
      params.to,
      params.amount,
    );
    setFeeData(data);
  }, []);

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
          label={`${getText(
            I18N.gasPrice,
          )} (${feeData?.gasLimit.getWeiSymbol()})`}
          placeholder={I18N.empty}
          value={gasPrice}
          onChangeText={setGasPrice}
          editable={activeTabIndex === 3}
        />
        <Spacer height={24} />
        <TextField
          label={I18N.adjustment}
          placeholder={I18N.empty}
          value={adjustment}
          onChangeText={setAdjustment}
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
