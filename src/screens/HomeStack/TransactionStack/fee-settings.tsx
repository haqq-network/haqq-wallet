import {useCallback, useEffect, useState} from 'react';

import {BigNumber} from 'ethers';
import {observer} from 'mobx-react';
import {ActivityIndicator, View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {
  TopTabNavigator,
  TopTabNavigatorVariant,
} from '@app/components/top-tab-navigator';
import {
  Button,
  ButtonVariant,
  First,
  Spacer,
  Text,
  TextField,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useSumAmount, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {EstimationVariant, Fee} from '@app/models/fee';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {CalculatedFees} from '@app/services/eth-network/types';

const TABS = [I18N.low, I18N.average, I18N.high, I18N.custom];

export const FeeSettingsScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  const {params} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.FeeSettings
  >();
  const [isEstimating, setEstimating] = useState(false);
  const amountsGasLimit = useSumAmount(
    new Balance(Fee.gasLimitString || Balance.Empty),
    undefined,
    undefined,
    undefined,
    (amount, formattedString) => {
      Fee.setGasLimit(formattedString);
    },
  );
  const amountsMaxBaseFee = useSumAmount(
    new Balance(Fee.maxBaseFeeString || Balance.Empty),
    undefined,
    undefined,
    undefined,
    (amount, formattedString) => {
      Fee.setMaxBaseFee(formattedString);
    },
  );
  const amountsMaxPriorityFee = useSumAmount(
    new Balance(Fee.maxPriorityFeeString || Balance.Empty),
    undefined,
    undefined,
    undefined,
    (amount, formattedString) => {
      Fee.setMaxPriorityFee(formattedString);
    },
  );

  const estimate = useCallback(
    async (estimationType: EstimationVariant, updateLastSavedFee = true) => {
      setEstimating(true);
      let data: CalculatedFees | null = null;
      if (estimationType === EstimationVariant.custom) {
        if (Fee.gasLimit && Fee.maxBaseFee && Fee.maxPriorityFee) {
          data = await EthNetwork.customEstimate(
            {
              from: params.from,
              to: params.to,
              value: params.amount,
              data: params.data,
            },
            {
              gasLimit: BigNumber.from(Fee.gasLimit.toWei()),
              maxBaseFee: BigNumber.from(Fee.maxBaseFee.toWei()),
              maxPriorityFee: BigNumber.from(Fee.maxPriorityFee.toWei()),
            },
          );

          data && Fee.setExpectedFee(data.expectedFee, updateLastSavedFee);
          setEstimating(false);
        }
      } else {
        data = await EthNetwork.estimate(
          {
            from: params.from,
            to: params.to,
            value: params.amount,
            data: params.data,
          },
          estimationType,
        );

        data && Fee.setCalculatedFees(data, updateLastSavedFee);
        setEstimating(false);
      }
    },
    [],
  );

  const onTabChange = useCallback((tabName: keyof typeof EstimationVariant) => {
    Fee.setEstimationType(EstimationVariant[tabName]);
  }, []);

  const handleApply = () => {
    navigation.goBack();
  };

  useEffect(() => {
    estimate(Fee.estimationType);
  }, [Fee.estimationType]);

  useEffect(() => {
    estimate(Fee.estimationType, false);
  }, [Fee.gasLimitString, Fee.maxBaseFeeString, Fee.maxPriorityFeeString]);

  const handleReset = () => Fee.resetCalculatedFees();

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.tabs}>
          <TopTabNavigator
            contentContainerStyle={styles.tabsContentContainerStyle}
            variant={TopTabNavigatorVariant.large}
            disabled={isEstimating}
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
          value={amountsGasLimit.amount}
          onChangeText={amountsGasLimit.setAmount}
          editable={Fee.estimationType === EstimationVariant.custom}
          keyboardType="numeric"
          inputMode="decimal"
          returnKeyType="done"
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
          value={amountsMaxBaseFee.amount}
          onChangeText={amountsMaxBaseFee.setAmount}
          editable={Fee.estimationType === EstimationVariant.custom}
          keyboardType="numeric"
          inputMode="decimal"
          returnKeyType="done"
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
          value={amountsMaxPriorityFee.amount}
          onChangeText={amountsMaxPriorityFee.setAmount}
          editable={Fee.estimationType === EstimationVariant.custom}
          keyboardType="numeric"
          inputMode="decimal"
          returnKeyType="done"
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
          <Text variant={TextVariant.t11} i18n={I18N.feeSettingsExpectedFee} />
          <First>
            {isEstimating && (
              <ActivityIndicator
                size={'small'}
                color={getColor(Color.graphicGreen1)}
              />
            )}
            <Text variant={TextVariant.t11} color={Color.textBase2}>
              {Fee.expectedFeeString}
            </Text>
          </First>
        </View>
      </View>
      <View>
        <Button
          variant={ButtonVariant.second}
          i18n={I18N.reset}
          disabled={!Fee.canReset || isEstimating}
          onPress={handleReset}
        />
        <Spacer height={16} />
        <Button
          variant={ButtonVariant.contained}
          loading={isEstimating}
          disabled={isEstimating}
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
