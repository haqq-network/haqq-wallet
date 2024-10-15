import React, {useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconsName, Spacer, Text, TextVariant} from '@app/components/ui';
import {CopyMenu} from '@app/components/ui/copy-menu';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {IWalletModel} from '@app/models/wallet';

type CardNameProps = {
  wallet: IWalletModel;
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
    <View style={styles.topNav}>
      <View>
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
      </View>
      {(app.isTesterMode || app.isDeveloper) && (
        <View style={styles.pathContainer}>
          <Text variant={TextVariant.t15} color={Color.textBase3}>
            m/{wallet.path}
          </Text>
        </View>
      )}
      <Spacer flex={1} />
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 6,
  },
  marginLeft: {marginLeft: 4},
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
  pathContainer: {},
});
