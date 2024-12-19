import React from 'react';

import {observer} from 'mobx-react';
import {TouchableOpacity, View, useWindowDimensions} from 'react-native';

import {Color} from '@app/colors';
import {DashedLine} from '@app/components/dashed-line';
import {SolidLine} from '@app/components/solid-line';
import {TokenRow} from '@app/components/token';
import {
  CardSmall,
  DataContent,
  First,
  Icon,
  IconsName,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet, WalletModel} from '@app/models/wallet';
import {IToken} from '@app/types';

import {Placeholder} from './placeholder';

export type Props = {
  wallet: WalletModel;
  tokens: IToken[];
  tokensOnly?: boolean;
  hideWalletSummary?: boolean;
  onPressToken?: (wallet: WalletModel, token: IToken, idx: number) => void;
  checkTokenSelected?: (
    wallet: WalletModel,
    token: IToken,
    idx: number,
  ) => boolean;
  onPressWallet?: (wallet: WalletModel) => void;
  isLast?: boolean;
};
const CARD_WIDTH = 57.78;
const CARD_RADIUS = 8;

export const WalletCard = observer(
  ({
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
    const balance = Wallet.getBalances(wallet.address);

    if (tokensOnly) {
      return tokens.map((token, idx) => {
        if (!token || !wallet) {
          return null;
        }
        return (
          <TokenRow
            key={`${wallet.address}_tokensOnly_wallet_card_token_row_${token.id}_${idx}`}
            onPress={() => onPressToken?.(wallet, token, idx)}
            item={token}
            checked={checkTokenSelected?.(wallet, token, idx)}
          />
        );
      });
    }

    if (!balance) {
      return (
        <>
          <Placeholder opacity={0.9}>
            <Placeholder.Item height={40} />
          </Placeholder>
          <Spacer height={8} />
        </>
      );
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
            title={balance?.available?.toEtherString()}
            subtitleProps={{
              numberOfLines: 1,
              ellipsizeMode: 'tail',
            }}
            subtitle={wallet.name}
            bold
          />
        </TouchableOpacity>

        <DashedLine
          style={styles.dashedLine}
          width={width - 40}
          color={Color.graphicSecond2}
        />

        {balance?.locked?.isPositive() && hideWalletSummary === false && (
          <>
            <View style={styles.row}>
              <Icon i18 color={Color.graphicBase1} name={IconsName.coin} />
              <Spacer width={4} />
              <Text
                variant={TextVariant.t14}
                color={Color.textBase1}
                i18n={I18N.lockedTokensAvailable}
                i18params={{count: balance?.available?.toFloatString() ?? '0'}}
              />
              <Spacer width={8} />
              <Icon i18 color={Color.graphicBase1} name={IconsName.lock} />
              <Spacer width={4} />
              <Text
                variant={TextVariant.t14}
                color={Color.textBase1}
                i18n={I18N.lockedTokensLocked}
                i18params={{count: balance?.locked?.toFloatString() ?? '0'}}
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
              key={`${wallet.address}_wallet_card_token_row_${token.id}_${idx}`}
              item={token}
              onPress={() => onPressToken?.(wallet, token, idx)}
              checked={checkTokenSelected?.(wallet, token, idx)}
            />
          );
        })}
        {!tokens.length && (
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
        <First>
          {isLast && <Spacer height={24} />}
          {tokens.length > 0 && (
            <SolidLine
              style={styles.line}
              width={width - 40}
              color={Color.graphicSecond1}
            />
          )}
        </First>
      </View>
    );
  },
);

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
