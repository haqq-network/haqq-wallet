import {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';
import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {ImageWrapper} from '@app/components/image-wrapper';
import {Icon, Spacer, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';

import {TransactionNetworkSelectItemProps} from './transaction-network-select.types';

import {TransactionStore} from '../transaction-store';

export const TransactionNetworkSelectItem = observer(
  ({item}: TransactionNetworkSelectItemProps) => {
    const params = useTypedRoute<
      TransactionStackParamList,
      TransactionStackRoutes.TransactionNetworkSelect
    >().params;

    const {toChainId, toAddress} = TransactionStore;

    const navigation = useTypedNavigation<TransactionStackParamList>();

    const isProviderDisabled = useMemo(() => {
      if (!item.supportAddresses) {
        return true;
      }

      return !item.supportAddresses.find(prefix => {
        if (prefix.length > toAddress.length) {
          return prefix.startsWith(toAddress);
        } else {
          return toAddress.startsWith(prefix);
        }
      });
    }, [item.supportAddresses]);

    const handlePress = useCallback(() => {
      if (!isProviderDisabled) {
        if (params?.wallet) {
          TransactionStore.toAddress =
            params.wallet.getAddressByProviderChainId(item.ethChainId);
        }
        TransactionStore.toChainId = item.ethChainId;
        navigation.goBack();
      }
    }, [item.ethChainId, isProviderDisabled]);

    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <View
          style={[
            styles.container,
            isProviderDisabled && styles.disabledContainer,
          ]}>
          <ImageWrapper source={item.icon} style={styles.icon} />
          <Spacer width={12} />
          <Text variant={TextVariant.t11}>{item.name}</Text>
          <Spacer width={8} />
          <Text variant={TextVariant.t11} color={Color.textBase2}>
            {item.networkType.toUpperCase()}
          </Text>
          <Spacer flex={1} />
          {toChainId === item.ethChainId && (
            <Icon color={Color.graphicGreen1} name="check" i24 />
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  },
);

const styles = createTheme({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  disabledContainer: {
    opacity: 0.2,
  },
  info: {justifyContent: 'space-between'},
  icon: {width: 42, height: 42},
});
