import React, {useCallback, useMemo} from 'react';

import {formatDistance} from 'date-fns';
import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Card,
  DataContent,
  Icon,
  IconsName,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {I18N} from '@app/i18n';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';

export type Props = {
  item: Transaction;
  onPress: (hash: string) => void;
  wallets: Realm.Results<Wallet>;
};

type IMapItem = {
  iconName: IconsName;
  title: I18N;
  sumTextColor: Color;
  amountText: I18N;
};

const DisplayMap: {[key: string]: IMapItem} = {
  send: {
    iconName: IconsName.arrow_send,
    title: I18N.transactionSendTitle,
    sumTextColor: Color.textRed1,
    amountText: I18N.transactionNegativeAmountText,
  },
  receive: {
    iconName: IconsName.arrow_receive,
    title: I18N.transactionReceiveTitle,
    sumTextColor: Color.textGreen1,
    amountText: I18N.transactionPositiveAmountText,
  },
};

export function TransactionRowWidget({item, onPress, wallets}: Props) {
  const isSend = useMemo(() => {
    return wallets
      .map(wallet => wallet.address.toLowerCase())
      .includes(item.from.toLowerCase());
  }, [wallets, item.from]);
  const DisplayMapItem = useMemo(
    () => DisplayMap[isSend ? 'send' : 'receive'],
    [isSend],
  );
  const handlePress = useCallback(() => {
    onPress(item.hash);
  }, [item.hash, onPress]);
  const currentWallet = useMemo(() => {
    return wallets.find(
      wallet =>
        item[isSend ? 'from' : 'to'].toLowerCase() ===
        wallet.address.toLowerCase(),
    );
  }, [isSend, item, wallets]);
  const subtitle = useMemo(
    () =>
      formatDistance(item.createdAt, Date.now(), {
        addSuffix: true,
      }),
    [item.createdAt],
  );

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon name={DisplayMapItem.iconName} color={Color.graphicBase1} />
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              {/* TODO: Current currency icon */}
              <Icon name={'logo'} color={Color.bg1} style={styles.logoIcon} />
            </View>
          </View>
        </View>
        <DataContent
          style={styles.infoContainer}
          titleI18n={DisplayMapItem.title}
          subtitle={
            <View style={styles.walletWrapper}>
              {!!currentWallet && (
                <>
                  <Card
                    width={20}
                    height={14}
                    pattern={currentWallet.pattern}
                    colorFrom={currentWallet.colorFrom}
                    colorTo={currentWallet.colorTo}
                    colorPattern={currentWallet.colorPattern}
                    borderRadius={3}
                    style={styles.removePadding}
                  />
                  <Spacer width={6} />
                </>
              )}
              <Text t14 color={Color.textBase2}>
                {subtitle}
              </Text>
            </View>
          }
          short
        />
        <Text
          t11
          color={DisplayMapItem.sumTextColor}
          i18n={DisplayMapItem.amountText}
          i18params={{value: cleanNumber(item.value)}}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = createTheme({
  walletWrapper: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  removePadding: {padding: 0},
  logoIcon: {
    width: 10.67,
    height: 10.67,
  },
  logoContainer: {
    backgroundColor: Color.bg3,
    height: 18,
    width: 18,
    borderRadius: 18 / 2,
    position: 'absolute',
    top: -1,
    right: -8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    height: 16,
    width: 16,
    borderRadius: 16 / 2,
    backgroundColor: Color.graphicGreen2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    backgroundColor: Color.bg3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
