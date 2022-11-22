import React, {useCallback, useEffect, useMemo, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {useNavigation} from '@react-navigation/native';
import {utils} from 'ethers';
import {StyleSheet, View} from 'react-native';

import {ListContact} from '@app/components/list-contact';
import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  KeyboardSafeArea,
  PasteIcon,
  QRScanner,
  Spacer,
  TextField,
} from '@app/components/ui';
import {hideModal, showModal} from '@app/helpers/modal';
import {withActionsContactItem} from '@app/hocs';
import {useApp} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {isHexString} from '@app/utils';
import {LIGHT_GRAPHIC_BASE_2, LIGHT_GRAPHIC_GREEN_1} from '@app/variables';

export type TransactionAddressProps = {
  initial?: string;
  onAddress: (address: string) => void;
};

const ListOfContacts = withActionsContactItem(ListContact, {
  nextScreen: 'transactionContactEdit',
});

export const TransactionAddress = ({
  initial = '',
  onAddress,
}: TransactionAddressProps) => {
  const app = useApp();
  const [address, setAddress] = useState(initial);
  const [error, setError] = useState(false);
  const {goBack} = useNavigation();
  const checked = useMemo(() => utils.isAddress(address.trim()), [address]);

  useEffect(() => {
    const toTrim = address.trim();

    if (toTrim.length >= 2 && !toTrim.startsWith('0x')) {
      return setError(true);
    }

    if (toTrim.length > 2 && !isHexString(toTrim)) {
      return setError(true);
    }

    if (toTrim.length < 42) {
      return setError(false);
    }

    if (!utils.isAddress(toTrim.trim())) {
      return setError(true);
    }

    setError(false);
  }, [address]);

  const onDone = useCallback(async () => {
    onAddress(address.trim());
  }, [onAddress, address]);

  const onPressQR = useCallback(() => {
    const subscriptionBack = () => {
      goBack();
      app.off('onCloseQr', subscriptionBack);
    };
    const subscription = ({to}: any) => {
      if (utils.isAddress(to)) {
        setAddress(to);
        app.off('address', subscription);
        app.off('onCloseQr', subscriptionBack);
        hideModal();
      }
    };
    app.on('address', subscription);

    app.on('onCloseQr', subscriptionBack);
    showModal('qr');
  }, [app, goBack]);

  const onPressClear = useCallback(() => setAddress(''), []);

  const onPressAddress = useCallback(
    (item: string) => {
      vibrate(HapticEffects.impactLight);
      onAddress(item);
    },
    [onAddress],
  );

  const onPressPaste = useCallback(async () => {
    vibrate(HapticEffects.impactLight);
    const pasteString = await Clipboard.getString();
    setAddress(pasteString);
  }, []);

  return (
    <KeyboardSafeArea>
      <TextField
        label={getText(I18N.transactionAddressLabel)}
        style={page.input}
        value={address}
        onChangeText={setAddress}
        error={error}
        errorText={getText(I18N.transactionAddressError)}
        autoFocus
        multiline
        twoIcons={address === ''}
        placeholder={getText(I18N.transactionAddressPlaceholder)}
        rightAction={
          address === '' ? (
            <View style={page.inputButtonContainer}>
              <IconButton onPress={onPressPaste}>
                <PasteIcon
                  color={LIGHT_GRAPHIC_GREEN_1}
                  width={25}
                  height={25}
                />
              </IconButton>
              <Spacer width={12} />
              <IconButton onPress={onPressQR}>
                <QRScanner
                  color={LIGHT_GRAPHIC_GREEN_1}
                  width={25}
                  height={25}
                />
              </IconButton>
            </View>
          ) : (
            <IconButton onPress={onPressClear}>
              <Icon s name="close_circle" color={LIGHT_GRAPHIC_BASE_2} />
            </IconButton>
          )
        }
      />

      <Spacer>
        <ListOfContacts onPressAddress={onPressAddress} />
      </Spacer>

      <Button
        disabled={!checked}
        variant={ButtonVariant.contained}
        title={getText(I18N.continue)}
        onPress={onDone}
        style={page.button}
      />
    </KeyboardSafeArea>
  );
};

const page = StyleSheet.create({
  input: {
    marginBottom: 12,
    marginHorizontal: 20,
  },
  inputButtonContainer: {
    flexDirection: 'row',
  },
  button: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
});
