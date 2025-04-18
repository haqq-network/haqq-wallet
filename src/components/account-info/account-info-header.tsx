import React, {useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  CardSmall,
  First,
  Icon,
  IconButton,
  Inline,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {CopyMenu} from '@app/components/ui/copy-menu';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {I18N} from '@app/i18n';
import {WalletModel} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {WalletType} from '@app/types';

import {StackedVestedTokens} from '../stacked-vested-tokens';
import {Placeholder} from '../ui/placeholder';

const CARD_WIDTH = 78;
const CARD_RADIUS = 8;

export type AccountInfoProps = {
  wallet: WalletModel;
  available: Balance;
  locked: Balance;
  staked: Balance;
  total: Balance;
  vested: Balance;
  unlock: Date;
  isBalanceLoading: boolean;
  onPressInfo: () => void;
  onSend: () => void;
  onReceive: () => void;
};

export const AccountInfoHeader = ({
  wallet,
  locked,
  staked,
  total,
  vested,
  available,
  unlock,
  isBalanceLoading,
  onPressInfo,
  onSend,
  onReceive,
}: AccountInfoProps) => {
  const formattedAddress = useMemo(
    () => shortAddress(wallet.getProviderSpecificAddress(), '•'),
    [wallet],
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
          <First>
            {isBalanceLoading && (
              <>
                <Placeholder opacity={0.8}>
                  <Placeholder.Item width={140} height={28} />
                </Placeholder>
                <Spacer height={10} />
              </>
            )}
            <Text
              variant={TextVariant.t3}
              children={total.toFiat({useDefaultCurrency: true})}
            />
          </First>
          <CopyMenu wallet={wallet} style={styles.copyButton} withSettings>
            <Text variant={TextVariant.t14} color={Color.textBase2}>
              {formattedAddress}
            </Text>
            <Icon
              i16
              name="copy"
              color={Color.graphicBase2}
              style={styles.copyIcon}
            />
          </CopyMenu>
        </View>
      </View>
      <StackedVestedTokens
        totalBalance={total}
        availableBalance={available}
        lockedBalance={locked}
        vestedBalance={vested}
        stakingBalance={staked}
        unlock={unlock}
        isBalanceLoading={isBalanceLoading}
        onPressInfo={onPressInfo}
      />
      <Inline gap={12} style={styles.iconButtons}>
        <IconButton
          disabled={wallet.type === WalletType.watchOnly}
          onPress={onSend}
          style={styles.iconButton}>
          <Icon i24 name="arrow_send" color={Color.textBase1} />
          <Text variant={TextVariant.t14} i18n={I18N.walletCardSend} />
        </IconButton>
        <IconButton onPress={onReceive} style={styles.iconButton}>
          <Icon i24 name="arrow_receive" color={Color.textBase1} />
          <Text variant={TextVariant.t14} i18n={I18N.modalDetailsQRReceive} />
        </IconButton>
      </Inline>
      <Spacer height={24} />
    </View>
  );
};

const styles = createTheme({
  header: {
    paddingHorizontal: 20,
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
