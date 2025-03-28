import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {BlurView, Icon, IconButton, IconsName, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {WalletModel} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {IS_IOS, SYSTEM_BLUR_2} from '@app/variables/common';

type CardButtonsProps = {
  wallet: WalletModel;
  cardState: string;
  testID?: string;
  isBalanceLoading: boolean;
  onPressSend: (address: string) => void;
  onPressReceive: (address: string) => void;
};

export const CardButtons = ({
  wallet,
  cardState,
  testID,
  isBalanceLoading,
  onPressReceive,
  onPressSend,
}: CardButtonsProps) => {
  const onReceive = () => {
    onPressReceive(wallet.address);
  };

  const onSend = () => {
    onPressSend(wallet.address);
  };

  return (
    <View style={styles.buttonsContainer}>
      <View style={styles.button}>
        {IS_IOS && <BlurView action="sent" cardState={cardState} />}
        <IconButton
          style={styles.spacer}
          disabled={wallet.type === WalletType.watchOnly || isBalanceLoading}
          onPress={onSend}
          testID={`${testID}_send`}>
          <Icon i24 name={IconsName.arrow_send} color={Color.graphicBase3} />
          <Text i18n={I18N.walletCardSend} color={Color.textBase3} />
        </IconButton>
      </View>
      <View style={styles.button}>
        {IS_IOS && <BlurView action="receive" cardState={cardState} />}
        <IconButton
          style={styles.spacer}
          onPress={onReceive}
          testID={`${testID}_receive`}>
          <Icon i24 name={IconsName.arrow_receive} color={Color.graphicBase3} />
          <Text color={Color.textBase3} i18n={I18N.modalDetailsQRReceive} />
        </IconButton>
      </View>
    </View>
  );
};

const styles = createTheme({
  spacer: {flex: 1},
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  button: {
    height: 54,
    marginHorizontal: 6,
    flex: 1,
    backgroundColor: IS_IOS ? Color.transparent : SYSTEM_BLUR_2,
    borderRadius: 16,
    padding: 6,
    overflow: 'hidden',
  },
});
