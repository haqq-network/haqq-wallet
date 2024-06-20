import {useCallback, useEffect} from 'react';

import {BigNumber} from 'ethers';
import {observer} from 'mobx-react';
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
import {EstimationVariant, Fee} from '@app/models/fee';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {CalculatedFees} from '@app/services/eth-network/types';

const TABS = [I18N.low, I18N.average, I18N.high, I18N.custom];

export const FeeSettingsScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  const {params} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.FeeSettings
  >();

  const estimate = async (estimationType: EstimationVariant) => {
    let data: CalculatedFees | null = null;
    if (estimationType === EstimationVariant.custom) {
      if (Fee.gasLimit && Fee.maxBaseFee && Fee.maxPriorityFee) {
        data = await EthNetwork.customEstimate(
          {
            from: params.from,
            to: params.to,
            value: params.amount,
          },
          {
            gasLimit: BigNumber.from(Fee.gasLimit.toWei()),
            maxBaseFee: BigNumber.from(Fee.maxBaseFee.toWei()),
            maxPriorityFee: BigNumber.from(Fee.maxPriorityFee.toWei()),
          },
        );
      }
    } else {
      data = await EthNetwork.estimate(
        {
          from: params.from,
          to: params.to,
          value: params.amount,
        },
        estimationType,
      );
    }

    data && Fee.setCalculatedFees(data);
  };

  const onTabChange = useCallback((tabName: keyof typeof EstimationVariant) => {
    Fee.setEstimationType(EstimationVariant[tabName]);
  }, []);

  const handleApply = () => {
    navigation.goBack();
  };

  useEffect(() => {
    estimate(Fee.estimationType);
  }, [
    Fee.estimationType,
    Fee.gasLimitString,
    Fee.maxBaseFeeString,
    Fee.maxPriorityFeeString,
  ]);

  const handleReset = () => Fee.resetCalculatedFees();

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.tabs}>
          <TopTabNavigator
            contentContainerStyle={styles.tabsContentContainerStyle}
            variant={TopTabNavigatorVariant.large}
            onTabChange={onTabChange}
            activeTabIndex={Fee.estimationType}
            initialTabIndex={Fee.estimationType}>
            {TABS.map((tab, index) => (
              <TopTabNavigator.Tab
                key={getText(tab)}
                testID={`FeeSettings${getText(tab)}Tab`}
                name={EstimationVariant[index]}
                title={tab}
                component={null}
              />
            ))}
          </TopTabNavigator>
        </View>
        <TextField
          label={I18N.gasLimit}
          placeholder={I18N.empty}
          value={Fee.gasLimitString}
          onChangeText={Fee.setGasLimit}
          editable={Fee.estimationType === EstimationVariant.custom}
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
          value={Fee.maxBaseFeeString}
          onChangeText={Fee.setMaxBaseFee}
          editable={Fee.estimationType === EstimationVariant.custom}
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
          value={Fee.maxPriorityFeeString}
          onChangeText={Fee.setMaxPriorityFee}
          editable={Fee.estimationType === EstimationVariant.custom}
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
            {Fee.expectedFeeString}
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
});

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
