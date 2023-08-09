import React, {useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  CardSmall,
  CopyButton,
  Icon,
  IconButton,
  Inline,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/types';

const CARD_WIDTH = 78;
const CARD_RADIUS = 8;

export type AccountInfoProps = {
  wallet: Wallet;
  balance: Balance;
  onSend: () => void;
  onReceive: () => void;
};
export const AccountInfoHeader = ({
  wallet,
  balance,
  onSend,
  onReceive,
}: AccountInfoProps) => {
  const formattedAddress = useMemo(
    () => shortAddress(wallet.address, '•'),
    [wallet.address],
  );

  return (
    <View>
      <View style={styles.header}>
        <CardSmall
          width={CARD_WIDTH}
          borderRadius={CARD_RADIUS}
          pattern={wallet.pattern}
          colorFrom={wallet.colorFrom}
          colorTo={wallet.colorTo}
          colorPattern={wallet.colorPattern}
        />
        <View style={styles.headerContent}>
          <Text
            t3
            i18n={I18N.amountISLM}
            i18params={{amount: balance.toFloatString()}}
          />
          <CopyButton value={wallet.address} style={styles.copyButton}>
            <Text t14 color={Color.textBase2}>
              {formattedAddress}
            </Text>
            <Icon
              i16
              name="copy"
              color={Color.graphicBase2}
              style={styles.copyIcon}
            />
          </CopyButton>
        </View>
      </View>
      <Spacer height={24} />
      <Inline gap={12} style={styles.iconButtons}>
        <IconButton onPress={onSend} style={styles.iconButton}>
          <Icon i24 name="arrow_send" color={Color.textBase1} />
          <Text t14 i18n={I18N.walletCardSend} />
        </IconButton>
        <IconButton onPress={onReceive} style={styles.iconButton}>
          <Icon i24 name="arrow_receive" color={Color.textBase1} />
          <Text t14 i18n={I18N.modalDetailsQRReceive} />
        </IconButton>
      </Inline>
      <Spacer height={24} />
    </View>
  );
};

const styles = createTheme({
  header: {
    marginHorizontal: 20,
    flexDirection: 'row',
  },
  headerContent: {
    marginLeft: 12,
  },
  copyIcon: {
    marginLeft: 4,
  },
  copyButton: {
    marginTop: 2,
  },
  iconButtons: {
    marginHorizontal: 20,
  },
  iconButton: {
    backgroundColor: Color.bg8,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
