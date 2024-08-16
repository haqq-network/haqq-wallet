import React from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useSumAmount} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {IToken} from '@app/types';

import {ImageWrapper} from '../image-wrapper';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  First,
  LabeledBlock,
  Spacer,
  Text,
  TextField,
  TextFieldProps,
  TextVariant,
} from '../ui';
import {Placeholder} from '../ui/placeholder';

export type SwapInputProps = {
  token: IToken;
  currentBalance: Balance;
  availableBalance: Balance;
  amounts: ReturnType<typeof useSumAmount>;
  isLoading?: boolean;
  showMaxButton?: boolean;
  disableTextFieldLoader?: boolean;
  onPressMax?(): void;
  onPressChangeToken(): void;
} & Pick<
  TextFieldProps,
  'onBlur' | 'editable' | 'label' | 'placeholder' | 'autoFocus'
>;

export const SwapInput = observer(
  ({
    amounts,
    availableBalance,
    currentBalance,
    token,
    isLoading,
    showMaxButton = false,
    disableTextFieldLoader = false,
    onPressChangeToken,
    onPressMax,
    ...inputProps
  }: SwapInputProps) => {
    return (
      <View>
        <View style={styles.amountContainer}>
          <First>
            {isLoading && disableTextFieldLoader === false && (
              <View style={styles.amountInput}>
                <Placeholder opacity={0.7}>
                  <Placeholder.Item width={'100%'} height={58} />
                </Placeholder>
              </View>
            )}
            <TextField
              rightAction={
                showMaxButton ? (
                  <Button
                    i18n={I18N.swapScreenMax}
                    variant={ButtonVariant.text}
                    textColor={
                      isLoading ? Color.textBase2 : Color.graphicGreen1
                    }
                    size={ButtonSize.small}
                    onPress={onPressMax}
                    disabled={isLoading}
                  />
                ) : undefined
              }
              style={styles.amountInput}
              error={!!amounts.error}
              errorText={amounts.error}
              {...inputProps}
              value={amounts.amount}
              onChangeText={amounts.setAmount}
              keyboardType="numeric"
              inputMode="decimal"
              returnKeyType="done"
            />
          </First>
          <Spacer width={10} />

          <LabeledBlock
            i18nLabel={I18N.transactionCrypto}
            style={styles.cryptoBlock}
            onPress={onPressChangeToken}>
            <View style={styles.cryptoBlockWrapper}>
              {!!token.image && (
                <ImageWrapper
                  style={styles.cryptoBlockImage}
                  source={token.image}
                />
              )}
              <Text
                style={styles.cryptoBlockTitle}
                t11
                color={Color.textBase1}
                numberOfLines={1}
                ellipsizeMode="middle">
                {token.symbol}
              </Text>
            </View>
          </LabeledBlock>
        </View>

        <View>
          <Spacer height={4} />
          <Text
            variant={TextVariant.t14}
            color={Color.textBase2}
            i18n={I18N.swapInputAmountData}
            i18params={{
              currentFiatAmount: currentBalance.toFiat({
                useDefaultCurrency: true,
              }),
              availableAmount: availableBalance.toBalanceString('auto'),
            }}
          />
        </View>
      </View>
    );
  },
);

const styles = createTheme({
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountInput: {
    flex: 3.8,
  },
  cryptoBlockImage: {
    maxHeight: 12,
    maxWidth: 12,
    width: 12,
    height: 12,
    borderRadius: 5,
    overflow: 'hidden',
    alignSelf: 'center',
    marginRight: 4,
  },
  cryptoBlockTitle: {
    marginRight: 8,
  },
  cryptoBlockWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cryptoBlock: {
    flex: 1,
    alignItems: 'center',
    height: 58,
  },
});
