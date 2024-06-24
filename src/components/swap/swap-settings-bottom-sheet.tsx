import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import {useKeyboard} from '@react-native-community/hooks';
import {Dimensions, View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useSumAmount} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {IS_IOS} from '@app/variables/common';

import {BottomSheet, BottomSheetRef} from '../bottom-sheet';
import {
  Button,
  ButtonVariant,
  First,
  Icon,
  InfoBlock,
  KeyboardSafeArea,
  Spacer,
  TextField,
} from '../ui';

export type SwapTransactionSettings = {
  slippage: string; // Slippage Tolerance (%)
  deadline: string; // Transaction deadline (min)
};

export interface SwapSettingBottomSheetProps {
  value: SwapTransactionSettings;
  onSettingsChange: (settings: SwapTransactionSettings) => void;
}

export interface SwapSettingBottomSheetRef {
  close: () => void;
  open: () => void;
}

const SLIPPAGE_MIN = 0.05;
const SLIPPAGE_MAX = 50;

const DEADLINE_MIN = 1;
const DEADLINE_MAX = 60;

export const SWAP_SETTINGS_DEFAULT: SwapTransactionSettings = {
  slippage: '0.5',
  deadline: '30',
};

export const SwapSettingBottomSheet = React.forwardRef<
  SwapSettingBottomSheetRef,
  SwapSettingBottomSheetProps
>(({value, onSettingsChange}, ref) => {
  const [isOpen, setOpen] = useState(false);
  const slippage = useSumAmount(
    new Balance(value?.slippage, 0),
    undefined,
    undefined,
    amount => {
      const num = amount.toEther();
      if (num < SLIPPAGE_MIN || num > SLIPPAGE_MAX) {
        return getText(I18N.swapSettingsSlippageError);
      }
      return '';
    },
  );
  const deadline = useSumAmount(
    new Balance(value?.deadline, 0),
    undefined,
    undefined,
    amount => {
      const num = amount.toEther();
      if (num < DEADLINE_MIN || num > DEADLINE_MAX) {
        return getText(I18N.swapSettingsDeadlineError);
      }
      return '';
    },
  );
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const isApplyPressed = useRef(false);

  const {keyboardHeight, keyboardShown} = useKeyboard();

  const isAnyError = !!slippage.error || !!deadline.error;

  const isResetDisabled = useMemo(() => {
    if (isAnyError) {
      return false;
    }
    return (
      slippage.amount === SWAP_SETTINGS_DEFAULT.slippage &&
      deadline.amount === SWAP_SETTINGS_DEFAULT.deadline
    );
  }, [slippage, deadline, isAnyError]);

  const isApplyDisabled = useMemo(() => {
    if (isAnyError) {
      return true;
    }
    return (
      slippage.amount === value?.slippage && deadline.amount === value?.deadline
    );
  }, [slippage, deadline]);

  const onClose = useCallback(() => {
    setOpen(false);
    // save data if apply button is pressed
    if (isApplyPressed.current) {
      isApplyPressed.current = false;
      onSettingsChange({slippage: slippage.amount, deadline: deadline.amount});
    } else {
      // reset data if close without apply
      slippage.setAmount(value?.slippage);
      deadline.setAmount(value?.deadline);
    }
  }, [slippage, deadline, onSettingsChange]);
  const handleOpen = useCallback(() => {
    setOpen(true);
    bottomSheetRef.current?.open();
  }, []);
  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const onPressReset = useCallback(() => {
    slippage.setAmount(SWAP_SETTINGS_DEFAULT.slippage);
    deadline.setAmount(SWAP_SETTINGS_DEFAULT.deadline);
  }, [slippage, deadline]);

  const onPressApply = useCallback(() => {
    isApplyPressed.current = true;
    handleClose();
  }, [handleClose]);

  useImperativeHandle(ref, () => ({
    close: handleClose,
    open: handleOpen,
  }));

  if (!isOpen) {
    return null;
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      i18nTitle={I18N.swapTransactionSettingsTitle}
      fullscreen
      contentContainerStyle={styles.contentContainerStyle}
      scrollable={false}
      onClose={onClose}>
      <KeyboardSafeArea isNumeric style={styles.keyboardContainer}>
        <View style={styles.containerContent}>
          <TextField
            value={slippage.amount}
            onChangeText={slippage.setAmount}
            error={!!slippage.error}
            errorText={slippage.error}
            label={I18N.swapSettingsSlippageLabel}
            placeholder={I18N.swapSettingsSlippagePlaceholder}
            keyboardType="numeric"
            inputMode="decimal"
            returnKeyType="done"
          />
          <Spacer height={20} />
          <InfoBlock
            warning
            icon={<Icon name={'warning'} color={Color.textYellow1} />}
            i18n={I18N.swapSettingsSlippageWarning}
          />
          <TextField
            value={deadline.amount}
            onChangeText={deadline.setAmount}
            error={!!deadline.error}
            errorText={deadline.error}
            label={I18N.swapSettingsDeadlineLabel}
            placeholder={I18N.swapSettingsDeadlinePlaceholder}
            keyboardType="numeric"
            inputMode="decimal"
            returnKeyType="done"
          />
        </View>

        <View style={styles.containerContent}>
          <Button
            i18n={I18N.swapSettingsReset}
            variant={ButtonVariant.second}
            onPress={onPressReset}
            disabled={isResetDisabled}
          />
          <Spacer height={16} />
          <Button
            i18n={I18N.swapSettingsApply}
            variant={ButtonVariant.contained}
            onPress={onPressApply}
            disabled={isApplyDisabled}
          />
          <First>
            {IS_IOS && keyboardShown && <Spacer height={keyboardHeight / 2} />}
            <Spacer height={20} />
          </First>
        </View>
      </KeyboardSafeArea>
    </BottomSheet>
  );
});

const styles = createTheme({
  contentContainerStyle: {
    // bottom: 0,
    // position: 'absolute',
    // flex: 1,
  },
  containerContent: {},
  keyboardContainer: {
    flex: 1,
    height: () => Dimensions.get('screen').height / 1.3,
    justifyContent: 'space-between',
  },
});
