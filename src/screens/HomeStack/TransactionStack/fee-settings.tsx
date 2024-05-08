import {View} from 'react-native';

import {Color} from '@app/colors';
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
import {I18N} from '@app/i18n';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';

export const FeeSettingsScreen = () => {
  const {params} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.FeeSettings
  >();

  return (
    <View style={styles.container}>
      <View>
        <TextField label={I18N.gasLimit} placeholder={I18N.empty} />
        <Spacer height={24} />
        <TextField label={I18N.gasPrice} placeholder={I18N.empty} />
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
  // address: {
  //   marginBottom: 40,
  //   marginHorizontal: 27.5,
  // },
  // subtitle: {
  //   marginBottom: 4,
  // },
  // icon: {
  //   marginBottom: 16,
  //   alignSelf: 'center',
  //   width: 64,
  //   height: 64,
  // },
  // info: {
  //   borderRadius: 16,
  //   backgroundColor: Color.bg3,
  // },
  // sum: {
  //   fontWeight: '700',
  //   fontSize: 28,
  //   lineHeight: 38,
  // },
  // submit: {
  //   marginVertical: 16,
  // },
  // spacer: {
  //   justifyContent: 'center',
  // },
  // feeContainer: {
  //   flexDirection: 'row',
  // },
});
