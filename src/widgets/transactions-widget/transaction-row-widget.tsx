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
import {Wallet} from '@app/models/wallet';
import {
  ContractNameMap,
  OnTransactionRowPress,
  TransactionListContract,
  TransactionListReceive,
  TransactionListSend,
  TransactionSource,
} from '@app/types';

export type Props = {
  item: TransactionListSend | TransactionListReceive | TransactionListContract;
  onPress: OnTransactionRowPress;
  wallets: Realm.Results<Wallet>;
  contractNameMap: ContractNameMap;
};

type IMapItem = {
  iconName: IconsName;
  title: I18N;
  sumTextColor: Color;
  amountText: I18N;
};

const DisplayMap: {[key: string]: IMapItem} = {
  [TransactionSource.send]: {
    iconName: IconsName.arrow_send,
    title: I18N.transactionSendTitle,
    sumTextColor: Color.textRed1,
    amountText: I18N.transactionNegativeAmountText,
  },
  [TransactionSource.receive]: {
    iconName: IconsName.arrow_receive,
    title: I18N.transactionReceiveTitle,
    sumTextColor: Color.textGreen1,
    amountText: I18N.transactionPositiveAmountText,
  },
  [TransactionSource.contract]: {
    iconName: IconsName.contract,
    title: I18N.transactionContractTitle,
    sumTextColor: Color.textGreen1,
    amountText: I18N.transactionPositiveAmountText,
  },
};

export const TransactionRowWidget = ({
  item,
  onPress,
  wallets,
  contractNameMap,
}: Props) => {
  const adressList = Wallet.addressList();
  const contractName = useMemo(
    () => contractNameMap[item.to],
    [contractNameMap, item.to],
  );

  const isSend = useMemo(() => {
    return (
      item.source === TransactionSource.send || adressList.includes(item.from)
    );
  }, [item.source, adressList, item.from]);
  const DisplayMapItem = useMemo(() => {
    if (isSend && item.source === TransactionSource.contract) {
      const sendMap = DisplayMap[TransactionSource.send];
      const contractMap = DisplayMap[TransactionSource.contract];
      return {
        ...sendMap,
        iconName: contractMap.iconName,
        title: contractMap.title,
      };
    }
    return DisplayMap[item.source];
  }, [item.source, isSend]);
  const handlePress = useCallback(() => {
    onPress(item.hash, {contractName});
  }, [item.hash, onPress, contractName]);
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
        {!!item.value && (
          <Text
            t11
            color={DisplayMapItem.sumTextColor}
            i18n={DisplayMapItem.amountText}
            i18params={{value: cleanNumber(item.value)}}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

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
