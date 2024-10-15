import React, {useMemo} from 'react';

import {TouchableOpacity, View, useWindowDimensions} from 'react-native';

import {Color} from '@app/colors';
import {DashedLine} from '@app/components/dashed-line';
import {SolidLine} from '@app/components/solid-line';
import {TokenRow} from '@app/components/token-row';
import {
  CardSmall,
  DataContent,
  Icon,
  IconsName,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {I18N} from '@app/i18n';
import {IWalletModel} from '@app/models/wallet';
import {IToken} from '@app/types';
import {calculateBalances} from '@app/utils';

export type Props = {
  wallet: IWalletModel;
  tokens: IToken[];
  tokensOnly?: boolean;
  hideWalletSummary?: boolean;
  onPressToken?: (wallet: IWalletModel, token: IToken, idx: number) => void;
  checkTokenSelected?: (
    wallet: IWalletModel,
    token: IToken,
    idx: number,
  ) => boolean;
  onPressWallet?: (wallet: IWalletModel) => void;
  isLast?: boolean;
};
const CARD_WIDTH = 57.78;
const CARD_RADIUS = 8;

export const WalletCard = ({
  wallet,
  tokens,
  tokensOnly,
  hideWalletSummary = false,
  onPressToken,
  onPressWallet,
  checkTokenSelected,
  isLast,
}: Props) => {
  const {width} = useWindowDimensions();
  const balances = useWalletsBalance([wallet]);
  const {available, locked} = useMemo(
    () => calculateBalances(balances, [wallet]),
    [balances, wallet],
  );

  if (tokensOnly) {
    return tokens.map((token, idx) => {
      if (!token || !wallet) {
        return null;
      }
      return (
        <TokenRow
          key={token.id}
          onPress={() => onPressToken?.(wallet, token, idx)}
          item={token}
          checked={checkTokenSelected?.(wallet, token, idx)}
        />
      );
    });
  }

  return (
    <View style={styles.column}>
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => onPressWallet?.(wallet)}>
        <CardSmall
          width={CARD_WIDTH}
          borderRadius={CARD_RADIUS}
          pattern={wallet.pattern}
          colorFrom={wallet.colorFrom}
          colorTo={wallet.colorTo}
          colorPattern={wallet.colorPattern}
        />
        <DataContent
          style={styles.info}
          title={available.toEtherString()}
          subtitle={wallet.name}
          bold
        />
      </TouchableOpacity>

      <DashedLine
        style={styles.dashedLine}
        width={width - 40}
        color={Color.graphicSecond2}
      />

      {locked?.isPositive() && hideWalletSummary === false && (
        <>
          <View style={styles.row}>
            <Icon i18 color={Color.graphicBase1} name={IconsName.coin} />
            <Spacer width={4} />
            <Text
              variant={TextVariant.t14}
              color={Color.textBase1}
              i18n={I18N.lockedTokensAvailable}
              i18params={{count: available?.toFloatString() ?? '0'}}
            />
            <Spacer width={8} />
            <Icon i18 color={Color.graphicBase1} name={IconsName.lock} />
            <Spacer width={4} />
            <Text
              variant={TextVariant.t14}
              color={Color.textBase1}
              i18n={I18N.lockedTokensLocked}
              i18params={{count: locked?.toFloatString() ?? '0'}}
            />
          </View>
          <DashedLine
            style={styles.dashedLine}
            width={width - 40}
            color={Color.graphicSecond2}
          />
        </>
      )}

      {tokens.map((token, idx) => {
        if (!token || !wallet) {
          return null;
        }
        return (
          <TokenRow
            key={token.id}
            item={token}
            onPress={() => onPressToken?.(wallet, token, idx)}
            checked={checkTokenSelected?.(wallet, token, idx)}
          />
        );
      })}
      {tokens.length > 0 && !isLast ? (
        <SolidLine
          style={styles.line}
          width={width - 40}
          color={Color.graphicSecond1}
        />
      ) : (
        <View style={styles.footer}>
          <Icon name={IconsName.coin} color={Color.textSecond1} />
          <Spacer width={4} />
          <Text
            variant={TextVariant.t13}
            color={Color.textSecond1}
            i18n={I18N.noTokens}
          />
        </View>
      )}
    </View>
  );
};

const styles = createTheme({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  line: {marginVertical: 12},
  dashedLine: {marginVertical: 4},
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  column: {flexDirection: 'column'},
  info: {
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
});
