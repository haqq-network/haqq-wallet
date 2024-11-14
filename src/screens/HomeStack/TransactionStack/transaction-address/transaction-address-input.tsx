import {useCallback} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  View,
} from 'react-native';

import {Color} from '@app/colors';
import {
  First,
  Icon,
  IconButton,
  IconsName,
  Spacer,
  TextField,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForScanQr} from '@app/helpers/await-for-scan-qr';
import {LinkType, parseDeepLink} from '@app/helpers/parse-deep-link';
import {I18N, getText} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {showUnrecognizedDataAttention} from '@app/utils';

import {TransactionAddressInputProps} from './transaction-address.types';

export const TransactionAddressInput = ({
  testID,
  address,
  setAddress,
  isError,
  setIsError,
  onDone,
}: TransactionAddressInputProps) => {
  const handleChangeAddress = useCallback(
    async (value: string) => {
      const nextValue = value.trim();
      if (nextValue) {
        setAddress(nextValue);
        setIsError(!AddressUtils.isValidAddress(nextValue));
      } else {
        setAddress('');
        setIsError(false);
      }
    },
    [setAddress, setIsError],
  );

  const onPressClear = useCallback(() => {
    setAddress('');
  }, [setAddress]);

  const onPressPaste = useCallback(async () => {
    vibrate(HapticEffects.impactLight);
    const pasteString = await Clipboard.getString();
    handleChangeAddress(pasteString);
  }, [handleChangeAddress]);

  const onPressQR = useCallback(async () => {
    const data = await awaitForScanQr();
    const {type, params} = parseDeepLink(data);

    switch (type) {
      case LinkType.Haqq:
      case LinkType.Address:
      case LinkType.Etherium:
        setAddress(params.address ?? '');
        break;
      default:
        setIsError(true);
        showUnrecognizedDataAttention();
        break;
    }
  }, [setAddress, setIsError]);

  const onSubmitEditing = useCallback(() => {
    if (!address) {
      return;
    }

    return onDone(address.trim());
  }, [onDone, address]);

  const onKeyPress = useCallback(
    ({nativeEvent}: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (nativeEvent.key === 'Enter') {
        onSubmitEditing();
      }
    },
    [onSubmitEditing],
  );

  return (
    <TextField
      label={I18N.transactionAddressLabel}
      style={styles.input}
      value={address}
      onChangeText={handleChangeAddress}
      error={isError}
      errorText={getText(I18N.transactionAddressError)}
      autoFocus
      multiline
      onKeyPress={onKeyPress}
      numberOfLines={10}
      placeholder={I18N.transactionAddressPlaceholder}
      testID={`${testID}_input`}
      rightAction={
        <First>
          {address === '' && (
            <View style={styles.inputButtonContainer}>
              <IconButton onPress={onPressPaste}>
                <Icon i24 name={IconsName.paste} color={Color.graphicGreen1} />
              </IconButton>
              <Spacer width={12} />
              <IconButton onPress={onPressQR}>
                <Icon
                  i24
                  name={IconsName.qr_scanner}
                  color={Color.graphicGreen1}
                />
              </IconButton>
            </View>
          )}
          <IconButton onPress={onPressClear}>
            <Icon
              i24
              name={IconsName.close_circle}
              color={Color.graphicBase2}
            />
          </IconButton>
        </First>
      }
    />
  );
};

const styles = createTheme({
  input: {
    marginBottom: 20,
  },
  inputButtonContainer: {
    flexDirection: 'row',
  },
});
