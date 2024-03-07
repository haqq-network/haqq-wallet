import React, {useMemo} from 'react';

import {View} from 'react-native';

import {Icon, IconsName, Text, TextVariant} from '@app/components/ui';
import {CopyMenu} from '@app/components/ui/copy-menu';
import {shortAddress} from '@app/helpers/short-address';
import {Wallet} from '@app/models/wallet';
import {Color, createTheme} from '@app/theme';

type CardNameProps = {
  wallet: Wallet;
  isBalancesFirstSync: boolean;
  onAccountInfo: () => void;
  testID?: string;
};

export const CardName = ({
  wallet,
  isBalancesFirstSync,
  onAccountInfo,
  testID,
}: CardNameProps) => {
  const formattedAddress = useMemo(
    () => shortAddress(wallet?.address ?? '', '•'),
    [wallet?.address],
  );

  return (
    <View style={[styles.topNav, styles.marginBottom]}>
      <Text
        variant={TextVariant.t12}
        style={styles.name}
        ellipsizeMode="tail"
        numberOfLines={1}
        suppressHighlighting={true}
        disabled={isBalancesFirstSync}
        onPress={onAccountInfo}>
        {wallet.name || 'Unknown'}
      </Text>
      <CopyMenu style={styles.copyIcon} value={wallet.address} withSettings>
        <Text
          variant={TextVariant.t14}
          color={Color.textBase3}
          testID={`${testID}_address`}>
          {formattedAddress}
        </Text>
        <Icon
          i16
          name={IconsName.copy}
          color={Color.graphicBase3}
          style={styles.marginLeft}
        />
        <Icon
          i16
          name={IconsName.more}
          color={Color.graphicBase3}
          style={styles.marginLeft}
        />
      </CopyMenu>
    </View>
  );
};

const styles = createTheme({
  topNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 0,
  },
  marginLeft: {marginLeft: 4},
  marginBottom: {marginBottom: 4},
  name: {
    flex: 1,
    color: Color.textSecond2,
    marginRight: 8,
  },
  copyIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
});
