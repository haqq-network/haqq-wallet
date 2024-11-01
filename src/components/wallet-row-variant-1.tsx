import React, {useCallback, useMemo} from 'react';

import {StyleSheet} from 'react-native';

import {CardSmall, DataContent, MenuNavigationButton} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {Provider} from '@app/models/provider';

import {WalletRowProps} from './wallet-row';

const CARD_WIDTH = 78;
const CARD_RADIUS = 8;

export const WalletRowVariant1 = ({
  item,
  onPress,
  hideArrow = false,
  checked = false,
  style,
  chainId,
}: Omit<WalletRowProps, 'type'>) => {
  const provider = useMemo(() => Provider.getByEthChainId(chainId!), [chainId]);
  const containerStyle = useMemo(
    () => StyleSheet.flatten([item.isHidden && {opacity: 0.5}, style]),
    [item.isHidden, style],
  );

  const addressString = useMemo(() => {
    if (provider?.isTron) {
      return shortAddress(item.tronAddress);
    }
    return shortAddress(item.address);
  }, [item, provider]);

  const pressCard = useCallback(
    () => onPress?.(item.address),
    [item.address, onPress],
  );

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
        colorPattern={item.colorPattern}
      />
      <DataContent
        style={styles.info}
        title={item.name}
        subtitle={addressString}
      />
    </MenuNavigationButton>
  );
};

const styles = createTheme({
  info: {
    marginLeft: 12,
    flex: 1,
  },
});
