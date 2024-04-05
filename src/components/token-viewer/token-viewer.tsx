import React, {useCallback, useMemo, useState} from 'react';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {StyleProp, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {
  Icon,
  IconButton,
  IconsName,
  Text,
  TextVariant,
} from '@app/components/ui';
import {WalletCard} from '@app/components/ui/walletCard';
import {createTheme} from '@app/helpers';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {HaqqEthereumAddress, IToken} from '@app/types';
import {CURRENCY_NAME} from '@app/variables/common';

export interface TokenViewerProps {
  data: Record<HaqqEthereumAddress, IToken[]>;
  style?: StyleProp<ViewStyle>;
  wallet?: Wallet;
}

const SortingNamesMap = {
  amount: getText(I18N.tokensSortingByAmount),
  available: getText(I18N.tokensSortingByAvailable),
};

const MIN_LOW_AMOUNT = 0.01;

export const TokenViewer = observer(
  ({data: _data, style, wallet}: TokenViewerProps) => {
    const data = useMemo(() => computed(() => _data), [_data]).get();
    const wallets = useMemo(
      () =>
        Object.keys(data)
          .map(item => Wallet.getById(item))
          .filter(item => !!item) as Wallet[],
      [data],
    );
    const balances = useWalletsBalance(wallets);
    const {showActionSheetWithOptions} = useActionSheet();

    const [showLowBalance, setShowLowBalance] = useState(true);
    const [sorting, setSorting] = useState(SortingNamesMap.amount);

    const lowBalanceIcon = useMemo(() => {
      return showLowBalance ? IconsName.eye_open : IconsName.eye_close;
    }, [showLowBalance]);

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
      setShowLowBalance(prev => !prev);
    }, []);

    const sort = useCallback(
      (a: HaqqEthereumAddress, b: HaqqEthereumAddress) => {
        const aBalance = balances[a];
        const bBalance = balances[b];

        if (!bBalance?.total || !aBalance?.total) {
          return -1;
        }

        if (sorting === SortingNamesMap.amount) {
          return bBalance.total.operate(aBalance.total, 'sub').toEther();
        }
        return bBalance.available.operate(aBalance.available, 'sub').toEther();
      },
      [balances],
    );

    const filter = useCallback(
      (address: HaqqEthereumAddress) => {
        if (wallet) {
          return address === wallet.address;
        } else {
          return true;
        }
      },
      [balances, wallet],
    );

    if (!Object.keys(data)) {
      return null;
    }

    return (
      <View style={style}>
        <View style={styles.row}>
          <IconButton onPress={onPressSort} style={styles.sortWrapper}>
            <Icon color={Color.graphicBase1} name={IconsName.arrow_sort} />
            <Text color={Color.graphicBase1} variant={TextVariant.t13}>
              {sorting}
            </Text>
          </IconButton>
          <IconButton onPress={onChangeViewModePress} style={styles.button}>
            <Icon color={Color.graphicBase1} name={lowBalanceIcon} />
            <Text
              variant={TextVariant.t13}
              color={Color.graphicBase1}
              i18n={I18N.tokensLowBalance}
            />
          </IconButton>
        </View>
        {(Object.keys(data) as HaqqEthereumAddress[])
          .filter(filter)
          .sort(sort)
          .map(address => {
            const _wallet = Wallet.getById(address);
            const tokens = data[address].filter(token => {
              if (showLowBalance) {
                return true;
              }
              const fiatString = token.value.toFiat();
              const fiat = parseFloat(fiatString);

              if (!fiatString || Number.isNaN(fiat)) {
                return token.value.raw.gte(MIN_LOW_AMOUNT);
              }

              return fiat >= MIN_LOW_AMOUNT;
            });

            if (!_wallet) {
              return null;
            }

            return (
              <WalletCard
                key={address}
                wallet={_wallet}
                tokens={tokens.filter(
                  item =>
                    item.is_in_white_list &&
                    // FIXME: only erc20 tokens or native currency (ISLM)
                    (item.is_erc20 || item.symbol === CURRENCY_NAME),
                )}
                tokensOnly={!!wallet}
              />
            );
          })}
      </View>
    );
  },
);

const styles = createTheme({
  sortWrapper: {flexDirection: 'row', alignItems: 'center'},
  button: {flexDirection: 'row'},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
