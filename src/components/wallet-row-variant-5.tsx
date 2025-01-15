import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';
import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {
  CardSmall,
  DataContent,
  MenuNavigationButton,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {splitAddress} from '@app/utils';

import {WalletRowProps} from './wallet-row';

const CARD_WIDTH = 78;
const CARD_RADIUS = 8;

export const WalletRowVariant5 = observer(
  ({
    item,
    onPress,
    hideArrow = false,
    checked = false,
    style,
    hideBalance,
    chainId,
  }: Omit<WalletRowProps, 'type'>) => {
    const provider = useMemo(
      () => Provider.getByEthChainId(chainId!),
      [chainId],
    );
    const containerStyle = useMemo(
      () => StyleSheet.flatten([item.isHidden && {opacity: 0.5}, style]),
      [item.isHidden, style],
    );

    const pressCard = useCallback(
      () => onPress?.(item.address),
      [item.address, onPress],
    );

    const balance = useMemo(
      () => Wallet.getBalance(item.address, 'available', provider),
      [item.address],
    );

    const addressString = useMemo(() => {
      if (provider?.isTron) {
        return `•••${splitAddress(item.tronAddress)[2]}`;
      }
      return `•••${splitAddress(item.address)[2]}`;
    }, [item, provider]);

    return (
      <MenuNavigationButton
        hideArrow={hideArrow}
        checked={checked}
        onPress={pressCard}
        style={containerStyle}>
        <CardSmall
          width={CARD_WIDTH}
          borderRadius={CARD_RADIUS}
          pattern={item.pattern}
          colorFrom={item.colorFrom}
          colorTo={item.colorTo}
          colorPattern={item.colorPattern}>
          <Text style={styles.address} color={Color.textBase3} t18>
            {addressString}
          </Text>
        </CardSmall>
        <DataContent
          style={styles.info}
          title={item.name}
          subtitle={!hideBalance ? balance.toBalanceString() : undefined}
        />
      </MenuNavigationButton>
    );
  },
);

const OFFSET = 8;

const styles = createTheme({
  info: {
    marginLeft: 12,
    marginVertical: 4,
    flex: 1,
  },
  address: {
    left: OFFSET,
    bottom: OFFSET,
    position: 'absolute',
    width: CARD_WIDTH - OFFSET * 2,
  },
});
