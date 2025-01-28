import {useCallback, useMemo} from 'react';

import {FlatList, ListRenderItemInfo} from 'react-native';

import {Color} from '@app/colors';
import {Chip} from '@app/components';
import {Icon, IconButton, IconsName} from '@app/components/ui';

import {TransactionAmountCrossChainSwapProvider} from '../transaction-amount.types';

export const TransactionAmountCrossChaimSwapProviderList = () => {
  const onProviderPress = useCallback(() => {}, []);

  const data: TransactionAmountCrossChainSwapProvider[] = useMemo(
    () => [
      {
        id: 1,
        title: 'Fastest',
        impact: 0,
        warning: 'KYC may be requested',
        description:
          'Streamlines route for 1-click transaction (sometimes more if intermediary appchains have yet to install Packet Forward Middleware',
      },
    ],
    [],
  );

  const keyExtractor = useCallback(
    (item: TransactionAmountCrossChainSwapProvider) => String(item.id),
    [],
  );
  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<TransactionAmountCrossChainSwapProvider>) => {
      return (
        <Chip title={item.title} subtitle={`(${item.impact}%)`}>
          <IconButton onPress={onProviderPress}>
            <Icon i18 color={Color.textGreen1} name={IconsName.info} />
          </IconButton>
        </Chip>
      );
    },
    [],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
};
