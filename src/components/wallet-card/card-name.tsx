import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  First,
  Icon,
  IconsName,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {CopyMenu} from '@app/components/ui/copy-menu';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {AppStore} from '@app/models/app';
import {Wallet, WalletModel} from '@app/models/wallet';

type CardNameProps = {
  wallet: WalletModel;
  onAccountInfo: () => void;
  testID?: string;
};

export const CardName = observer(
  ({wallet, onAccountInfo, testID}: CardNameProps) => {
    const formattedAddress = useMemo(
      () => shortAddress(wallet?.providerSpecificAddress ?? '', '•'),
      [wallet?.providerSpecificAddress],
    );

    return (
      <View style={styles.topNav}>
        <Spacer flex={1}>
          <Text
            variant={TextVariant.t12}
            style={styles.name}
            ellipsizeMode="tail"
            numberOfLines={1}
            suppressHighlighting={true}
            disabled={Wallet.isBalancesLoading}
            onPress={onAccountInfo}>
            {wallet.name}
          </Text>
        </Spacer>

        <First>
          {(AppStore.isTesterModeEnabled ||
            AppStore.isDeveloperModeEnabled) && (
            <Spacer flex={1}>
              <Text variant={TextVariant.t15} color={Color.textBase3}>
                [{wallet.type[0].toUpperCase()}] {wallet.path}
              </Text>
            </Spacer>
          )}
          <Spacer flex={1} />
        </First>

        <Spacer flex={1}>
          <CopyMenu style={styles.copyIcon} wallet={wallet} withSettings>
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
        </Spacer>
      </View>
    );
  },
);

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
    marginLeft: 8,
  },
});
