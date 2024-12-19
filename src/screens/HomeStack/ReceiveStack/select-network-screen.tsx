import React, {useCallback, useMemo} from 'react';

import {TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
import {ImageWrapper} from '@app/components/image-wrapper';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {I18N} from '@app/i18n';
import {ALL_NETWORKS_ID, Provider} from '@app/models/provider';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {ChainId} from '@app/types';

import {SelectNetworkItemType} from './receive-stack.types';

export function SelectNetworkScreen() {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.SelectNetwork
  >();

  const onSelect = useCallback(
    (chainId: ChainId) => () => {
      navigation.replace(HomeStackRoutes.Receive, {
        address: route.params.address,
        chainId,
      });
    },
    [route.params.address],
  );

  const onClose = () => {
    navigation.goBack();
  };

  const networks: SelectNetworkItemType[] = useMemo(() => {
    return Provider.getAll()
      .filter(p => p.isMainnet && p.id !== ALL_NETWORKS_ID)
      .map(provider => ({
        icon: provider.icon,
        providerName: provider.name,
        coinName: provider.coinName,
        chainId: provider.ethChainId,
      }));
  }, []);

  const closeDistance = useCalculatedDimensionsValue(({height}) => height / 2);

  return (
    <BottomSheet
      onClose={onClose}
      scrollable
      closeDistance={closeDistance}
      i18nTitle={I18N.yourAddresses}>
      <View>
        {networks.map(item => (
          <TouchableOpacity onPress={onSelect(item.chainId)}>
            <View style={styles.item}>
              <ImageWrapper
                resizeMode="cover"
                source={item.icon}
                style={styles.icon}
                borderRadius={12}
              />
              <View style={styles.addressBlock}>
                <Text variant={TextVariant.t11}>{item.providerName}</Text>
                <Text variant={TextVariant.t14} color={Color.textBase2}>
                  {item.coinName}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <Spacer height={50} />
      </View>
    </BottomSheet>
  );
}

const styles = createTheme({
  item: {flexDirection: 'row', alignItems: 'center'},
  addressBlock: {justifyContent: 'center', flex: 1},
  icon: {width: 42, height: 42, marginRight: 12, marginVertical: 16},
});
