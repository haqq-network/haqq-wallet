import {useCallback, useState} from 'react';

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

const TABS = [I18N.low, I18N.average, I18N.high, I18N.custom];
const INIT_TAB_INDEX = 1;

export const FeeSettingsScreen = () => {
  const {params} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.FeeSettings
  >();

  const [activeTabIndex, setActiveTabIndex] = useState(INIT_TAB_INDEX);

  const [gasLimit, setGasLimit] = useState('');
  const [gasPrice, setGasPrice] = useState('');
  const [adjustment, setAdjustment] = useState('');

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
                key={index}
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
        />
        <Spacer height={24} />
        <TextField
          label={I18N.gasPrice}
          placeholder={I18N.empty}
          value={gasPrice}
          onChangeText={setGasPrice}
        />
        <Spacer height={24} />
        <TextField
          label={I18N.adjustment}
          placeholder={I18N.empty}
          value={adjustment}
          onChangeText={setAdjustment}
        />
        <Spacer height={28} />
        <View style={styles.fee}>
          <Text variant={TextVariant.t11}>Expected Fee</Text>
          <Text variant={TextVariant.t11} color={Color.textBase2}>
            {params.fee.toBalanceString(4)}
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
