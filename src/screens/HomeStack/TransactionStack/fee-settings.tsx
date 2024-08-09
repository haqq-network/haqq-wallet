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
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {useSumAmount, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {EstimationVariant, Fee} from '@app/models/fee';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {CalculatedFees} from '@app/services/eth-network/types';

const TABS = [I18N.low, I18N.average, I18N.high, I18N.custom];

type ResetValues = {
  gasLimit: Balance;
  maxBaseFee: Balance;
  priorityFee: Balance;
} | null;

export const FeeSettingsScreen = observer(() => {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const {fee, from, to, value, data, successEventName} = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.FeeSettings
  >().params;

  const [isEstimating, setEstimating] = useState(false);
  const [type, setType] = useState(fee.estimationType);

  const [expectedFee, setExpectedFee] = useState<Balance | null>();
  const [resetValues, setResetValues] = useState<ResetValues>(null);

  const amountsGasLimit = useSumAmount(fee.gasLimit!);
  const amountsMaxBaseFee = useSumAmount(fee.maxBaseFee!);
  const amountsMaxPriorityFee = useSumAmount(fee.maxPriorityFee!);

  const estimate = useCallback(
    async (estimationType: EstimationVariant) => {
      setEstimating(true);
      let calculatedData: CalculatedFees | null = null;
      if (estimationType === EstimationVariant.custom) {
        if (
          amountsGasLimit.amount &&
          amountsMaxBaseFee.amount &&
          amountsMaxPriorityFee.amount
        ) {
          calculatedData = await EthNetwork.customEstimate(
            {
              from,
              to,
              value,
              data,
            },
            {
              gasLimit: BigNumber.from(
                new Balance(amountsGasLimit.amount).toWei(),
              ),
              maxBaseFee: BigNumber.from(
                new Balance(amountsMaxBaseFee.amount).toWei(),
              ),
              maxPriorityFee: BigNumber.from(
                new Balance(amountsMaxPriorityFee.amount).toWei(),
              ),
            },
          );

          calculatedData && setExpectedFee(calculatedData.expectedFee);
          setEstimating(false);
        }
      } else {
        calculatedData = await EthNetwork.estimate(
          {
            from,
            to,
            value,
            data,
          },
          estimationType,
        );

        setResetValues({
          gasLimit: calculatedData.gasLimit,
          maxBaseFee: calculatedData.maxBaseFee,
          priorityFee: calculatedData.maxPriorityFee,
        });

        amountsGasLimit.setAmount(String(calculatedData.gasLimit.toWei()), 0);
        amountsMaxBaseFee.setAmount(String(calculatedData.maxBaseFee.toGWei()));
        amountsMaxPriorityFee.setAmount(
          String(calculatedData.maxPriorityFee.toGWei()),
        );
        setExpectedFee(calculatedData.expectedFee);
        setEstimating(false);
      }
    },
    [
      amountsGasLimit.amount,
      amountsMaxBaseFee.amount,
      amountsMaxPriorityFee.amount,
    ],
  );

  const onTabChange = useCallback((tabName: keyof typeof EstimationVariant) => {
    setType(EstimationVariant[tabName]);
  }, []);

  const handleApply = () => {
    navigation.pop();
    app.emit(
      successEventName,
      // maxBaseFee & maxPriorityFee multiplied by 10^9 because of this numbers represents GWEI
      new Fee(
        {
          gasLimit: new Balance(amountsGasLimit.amount),
          maxBaseFee: new Balance(
            Number(amountsMaxBaseFee.amount) * 10 ** 9,
            0,
          ),
          maxPriorityFee: new Balance(
            Number(amountsMaxPriorityFee.amount) * 10 ** 9,
            0,
          ),
          expectedFee: expectedFee!,
        },
        type,
      ),
    );
  };

  useEffect(() => {
    estimate(type);
  }, [type]);

  useEffect(() => {
    type === EstimationVariant.custom && estimate(type);
  }, [type, estimate]);

  const handleReset = () => {
    if (resetValues) {
      amountsGasLimit.setAmount(String(resetValues.gasLimit.toWei()), 0);
      amountsMaxBaseFee.setAmount(String(resetValues.maxBaseFee.toGWei()));
      amountsMaxPriorityFee.setAmount(String(resetValues.priorityFee.toGWei()));
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.tabs}>
          <TopTabNavigator
            contentContainerStyle={styles.tabsContentContainerStyle}
            variant={TopTabNavigatorVariant.large}
            disabled={isEstimating}
            onTabChange={onTabChange}
            activeTabIndex={type}
            initialTabIndex={type}>
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
          editable={type === EstimationVariant.custom}
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
          editable={type === EstimationVariant.custom}
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
          editable={type === EstimationVariant.custom}
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
              {expectedFee?.toBalanceString(6)}
            </Text>
          </First>
        </View>
      </View>
      <View>
        <Button
          variant={ButtonVariant.second}
          i18n={I18N.reset}
          disabled={type !== EstimationVariant.custom || isEstimating}
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
