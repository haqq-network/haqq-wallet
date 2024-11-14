import React, {useCallback, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
import {Icon, IconsName, Spacer, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {sendNotification} from '@app/services';
import {
  AddressCosmosHaqq,
  AddressEthereum,
  AddressTron,
  ModalType,
  Modals,
} from '@app/types';
import {ETH_CHAIN_ID, MAINNET_ETH_CHAIN_ID} from '@app/variables/common';

import {ImageWrapper} from '../image-wrapper';

type AddressItem = {
  address: AddressCosmosHaqq | AddressEthereum | AddressTron;
  icon: string;
  providerName: string;
};

export function CopyAddressBottomSheet({
  wallet,
  onClose,
}: Modals[ModalType.copyAddressBottomSheet]) {
  const onPressCopy = useCallback(
    (address: string) => () => {
      onClose?.();
      Clipboard.setString(address);
      sendNotification(I18N.notificationCopied);
    },
    [onClose],
  );

  const onCloseModal = () => {
    onClose?.();
  };

  const addresses: AddressItem[] = useMemo(() => {
    const haqqProvider = Provider.getByEthChainId(MAINNET_ETH_CHAIN_ID);
    const ethProvider = Provider.getByEthChainId(ETH_CHAIN_ID);
    const tronProvider = Provider.getAll().find(p => p.isTron)!;

    const result: AddressItem[] = [
      {
        address: wallet.cosmosAddress,
        icon: haqqProvider?.icon || '',
        providerName: haqqProvider?.coinName || '',
      },
      {
        address: wallet.address,
        icon: ethProvider?.icon || '',
        providerName: ethProvider?.coinName || '',
      },
    ];

    if (tronProvider) {
      result.push({
        address: wallet.tronAddress,
        icon: tronProvider.icon,
        providerName: tronProvider.coinName,
      });
    }
    return result;
  }, []);

  return (
    <BottomSheet
      onClose={onCloseModal}
      scrollable
      contentContainerStyle={styles.container}
      i18nTitle={I18N.yourAddresses}>
      {addresses.map(item => (
        <TouchableOpacity onPress={onPressCopy(item.address)}>
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
                {shortAddress(item.address)}
              </Text>
            </View>
            <Icon i22 name={IconsName.copy} color={Color.textBase2} />
          </View>
        </TouchableOpacity>
      ))}
      <Spacer height={50} />
    </BottomSheet>
  );
}

const styles = createTheme({
  container: {height: '100%'},
  item: {flexDirection: 'row', alignItems: 'center'},
  addressBlock: {justifyContent: 'center', flex: 1},
  icon: {width: 42, height: 42, marginRight: 12, marginVertical: 16},
});
