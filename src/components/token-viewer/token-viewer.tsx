import React, {useCallback, useMemo, useState} from 'react';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {observer} from 'mobx-react';
import {StyleProp, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconButton, IconsName, Text} from '@app/components/ui';
import {WalletCard} from '@app/components/ui/walletCard';
import {createTheme} from '@app/helpers';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {IToken} from '@app/types';

export interface TokenViewerProps {
  data: Record<string, IToken[]>;
  style?: StyleProp<ViewStyle>;
}

const SortingNamesMap = {
  amount: getText(I18N.tokensSortingByAmount),
  available: getText(I18N.tokensSortingByAvailable),
};

export const TokenViewer = observer(({data, style}: TokenViewerProps) => {
  const wallets = useMemo(
    () =>
      Object.keys(data)
        .map(item => Wallet.getById(item))
        .filter(item => !!item) as Wallet[],
    [data],
  );
  const balances = useWalletsBalance(wallets);
  const {showActionSheetWithOptions} = useActionSheet();

  const [showZeroBalance, setShowZeroBalance] = useState(true);
  const [sorting, setSorting] = useState(SortingNamesMap.amount);

  const zeroBalanceIcon = useMemo(() => {
    return showZeroBalance ? IconsName.eye_open : IconsName.eye_close;
  }, [showZeroBalance]);

  const onPressSort = useCallback(() => {
    showActionSheetWithOptions(
      {
        options: [
          SortingNamesMap.amount,
          SortingNamesMap.available,
          getText(I18N.cancel),
        ],
        cancelButtonIndex: 2,
        message: getText(I18N.tokensSorting),
      },
      selectedIndex => {
        switch (selectedIndex) {
          // by amount
          case 0:
            setSorting(SortingNamesMap.amount);
            break;
          // by available
          case 1:
            setSorting(SortingNamesMap.available);
            break;
        }
      },
    );
  }, [showActionSheetWithOptions]);

  const onChangeViewModePress = useCallback(() => {
    setShowZeroBalance(prev => !prev);
  }, []);

  const sort = useCallback(
    (a: string, b: string) => {
      const aBalance = balances[a];
      const bBalance = balances[b];

      if (sorting === SortingNamesMap.amount) {
        return bBalance.total.operate(aBalance.total, 'sub').toEther();
      }
      return bBalance.available.operate(aBalance.available, 'sub').toEther();
    },
    [balances],
  );

  if (!Object.keys(data)) {
    return null;
  }

  return (
    <View style={style}>
      <View style={styles.row}>
        <IconButton onPress={onPressSort} style={styles.sortWrapper}>
          <Icon color={Color.graphicBase1} name={IconsName.arrow_sort} />
          <Text color={Color.graphicBase1} t13>
            {sorting}
          </Text>
        </IconButton>
        <IconButton onPress={onChangeViewModePress} style={styles.button}>
          <Icon color={Color.graphicBase1} name={zeroBalanceIcon} />
          <Text color={Color.graphicBase1} i18n={I18N.tokensZeroBalance} />
        </IconButton>
      </View>
      {Object.keys(data)
        .sort(sort)
        .map(address => {
          const wallet = Wallet.getById(address);
          const tokens = data[address].filter(token => {
            if (showZeroBalance) {
              return true;
            }
            return token.value.isPositive();
          });

          if (!wallet) {
            return null;
          }

          return <WalletCard key={address} wallet={wallet} tokens={tokens} />;
        })}
    </View>
  );
});

const styles = createTheme({
  sortWrapper: {flexDirection: 'row', alignItems: 'center'},
  button: {flexDirection: 'row'},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImage: {
    height: 80,
    width: 80,
    tintColor: Color.graphicSecond3,
  },
});
