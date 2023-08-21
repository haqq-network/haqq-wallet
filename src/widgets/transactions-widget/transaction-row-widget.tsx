import React, {useCallback, useMemo} from 'react';

import {formatDistance} from 'date-fns';
import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {DataContent, Icon, IconsName, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {I18N} from '@app/i18n';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {CURRENCY_NAME} from '@app/variables/common';

export type Props = {
  item: Transaction;
  onPress: (hash: string) => void;
};

type IMapItem = {
  iconName: IconsName;
  title: I18N;
  sumTextColor: Color;
  sign: string;
};

const DisplayMap: {[key: string]: IMapItem} = {
  send: {
    iconName: IconsName.arrow_send,
    title: I18N.transactionSendTitle,
    sumTextColor: Color.textRed1,
    sign: '-',
  },
  receive: {
    iconName: IconsName.arrow_receive,
    title: I18N.transactionReceiveTitle,
    sumTextColor: Color.textGreen1,
    sign: '+',
  },
};

export const TransactionRowWidget = ({item, onPress}: Props) => {
  const wallets = useMemo(() => Wallet.addressList(), []);
  const isSend = useMemo(() => {
    return wallets.includes(item.from.toLowerCase());
  }, [wallets, item.from]);
  const DisplayMapItem = useMemo(
    () => DisplayMap[isSend ? 'send' : 'receive'],
    [isSend],
  );
  const text = useMemo(
    () => `${DisplayMapItem.sign} ${cleanNumber(item.value)} ${CURRENCY_NAME}`,
    [item.value, DisplayMapItem],
  );
  const handlePress = useCallback(() => {
    onPress(item.hash);
  }, [item.hash, onPress]);
  const currentWallet = useMemo(() => {
    const allWallets = Wallet.getAll();
    return allWallets.find(
      wallet =>
        item[isSend ? 'from' : 'to'].toLowerCase() ===
        wallet.address.toLowerCase(),
    );
  }, [isSend, item]);
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
          subtitle={subtitle}
          short
          wallet={currentWallet}
        />
        <Text t11 color={DisplayMapItem.sumTextColor}>
          {text}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
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
