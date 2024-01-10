import React, {useMemo} from 'react';

import {View} from 'react-native';

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
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {IToken} from '@app/types';
import {calculateBalances, generateUUID} from '@app/utils';

export type Props = {
  wallet: Wallet;
  tokens: IToken[];
  tokensOnly?: boolean;
};
const CARD_WIDTH = 57.78;
const CARD_RADIUS = 8;

export const WalletCard = ({wallet, tokens, tokensOnly}: Props) => {
  const balances = useWalletsBalance([wallet]);
  const {available, locked} = useMemo(
    () => calculateBalances(balances, [wallet]),
    [balances, wallet],
  );

  if (tokensOnly) {
    return (
      <>
        <Spacer height={10} />
        {tokens.map(token => {
          return <TokenRow key={generateUUID()} item={token} />;
        })}
      </>
    );
  }

  return (
    <View style={styles.column}>
      <View style={styles.cardWrapper}>
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
      </View>

      <DashedLine width={1} color={Color.graphicSecond2} />

      {locked?.isPositive() && (
        <>
          <View style={styles.row}>
            <Icon i18 color={Color.graphicBase1} name={IconsName.coin} />
            <Spacer width={4} />
            <Text
              t13
              color={Color.textBase1}
              i18n={I18N.lockedTokensAvailable}
              i18params={{count: available?.toFloatString() ?? '0'}}
            />
            <Spacer width={8} />
            <Icon i18 color={Color.graphicBase1} name={IconsName.lock} />
            <Spacer width={4} />
            <Text
              t13
              color={Color.textBase1}
              i18n={I18N.lockedTokensLocked}
              i18params={{count: locked?.toFloatString() ?? '0'}}
            />
          </View>
          <DashedLine width={1} color={Color.graphicSecond2} />
        </>
      )}

      {tokens.map(token => {
        return <TokenRow key={generateUUID()} item={token} />;
      })}
      {tokens.length > 0 ? (
        <SolidLine style={styles.line} width={1} color={Color.graphicSecond2} />
      ) : (
        <View style={styles.footer}>
          <Icon name={IconsName.coin} color={Color.textSecond1} />
          <Spacer width={4} />
          <Text t13 color={Color.textSecond1} i18n={I18N.noTokens} />
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
