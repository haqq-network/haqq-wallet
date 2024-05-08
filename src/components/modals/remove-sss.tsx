import React, {useCallback, useEffect} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import {jsonrpcRequest} from '@haqq/shared-react-native';
import {observer} from 'mobx-react';
import {Alert, Image, Platform, View} from 'react-native';
import Config from 'react-native-config';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonVariant,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {removeLocalShare} from '@app/helpers/remove-local-share';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {Cloud} from '@app/services/cloud';
import {GoogleDrive} from '@app/services/google-drive';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {onLoginApple, onLoginGoogle} from '@app/services/provider-sss';
import {
  ShareCreateResponse,
  SharesResponse,
} from '@app/services/provider-sss-initialize';
import {RemoteConfig} from '@app/services/remote-config';
import {ModalType, Modals, WalletType} from '@app/types';

export const RemoveSSS = observer(({onClose}: Modals[ModalType.removeSSS]) => {
  useEffect(() => {
    vibrate(HapticEffects.warning);
  }, []);

  const onPressDelete = async (close: () => void) => {
    try {
      const sssWallets = Wallet.getAllVisible().filter(
        item => item.type === WalletType.sss,
      );
      const provider = Platform.OS === 'android' ? onLoginGoogle : onLoginApple;

      const creds = await provider();

      if (!creds.privateKey) {
        Logger.error('No Private Key Detected RemoveSSS');
        close();
        return;
      }

      const generateSharesUrl = RemoteConfig.get_env(
        'sss_generate_shares_url',
        Config.GENERATE_SHARES_URL,
      ) as string;

      const nodeDetailsRequest = await jsonrpcRequest<SharesResponse>(
        generateSharesUrl,
        'shares',
        [creds.verifier, creds.token, true],
      );
      const info = await accountInfo(creds.privateKey);

      await Promise.all(
        nodeDetailsRequest.shares.map(s =>
          jsonrpcRequest<ShareCreateResponse>(s[0], 'shareCreate', [
            creds.verifier,
            creds.token,
            info.publicKey,
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ])
            .then(r => [r.hex_share, s[1]])
            .catch(() => [null, s[1]]),
        ),
      );

      await removeLocalShare(creds.privateKey);

      const cloudEnabled = await Cloud.isEnabled();
      const googleEnabled = await GoogleDrive.isEnabled();

      if (googleEnabled) {
        const _storage = new GoogleDrive();
        sssWallets.forEach(item => {
          const shareKey = `haqq_${item.accountId?.toLowerCase()}`;
          _storage.removeItem(shareKey);
        });
      }
      if (cloudEnabled) {
        const _storage = new Cloud();
        sssWallets.forEach(item => {
          const shareKey = `haqq_${item.accountId?.toLowerCase()}`;
          _storage.removeItem(shareKey);
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        Logger.warn('RemoveSSS Error: ', err.message);
      }
    } finally {
      close();
    }
  };

  const showAlert = useCallback(
    (onClosePopup: (onEnd: (() => void) | undefined) => void) => {
      const close = () => onClosePopup(onClose);

      Alert.alert(
        getText(I18N.removeSSSAlertTitle),
        getText(I18N.removeSSSAlertDescription),
        [
          {
            text: getText(I18N.removeSSSPrimary),
            style: 'destructive',
            onPress: () => onPressDelete(close),
          },
          {
            text: getText(I18N.cancel),
            style: 'cancel',
            onPress: close,
          },
        ],
        {cancelable: false},
      );
    },
    [onClose],
  );

  return (
    <BottomPopupContainer>
      {onClosePopup => (
        <View style={styles.modalView}>
          <Text
            variant={TextVariant.t5}
            position={TextPosition.center}
            i18n={I18N.removeSSSTitle}
          />
          <Spacer height={8} />
          <Text variant={TextVariant.t14}>
            {getText(I18N.removeSSSDescription)}
            <Text
              variant={TextVariant.t14}
              i18n={I18N.removeSSSDescriptionImportant}
              color={Color.textRed1}
            />
          </Text>

          <Image
            source={require('@assets/images/remove-sss.png')}
            style={styles.img}
          />

          <View style={styles.buttonContainer}>
            <Button
              style={styles.button}
              variant={ButtonVariant.contained}
              i18n={I18N.removeSSSSecondary}
              onPress={() => onClosePopup(onClose)}
            />
            <Button
              style={styles.button}
              variant={ButtonVariant.text}
              textColor={Color.textRed1}
              i18n={I18N.removeSSSPrimary}
              onPress={() => showAlert(onClosePopup)}
            />
          </View>
        </View>
      )}
    </BottomPopupContainer>
  );
});

const styles = createTheme({
  modalView: {
    backgroundColor: Color.bg1,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
    paddingTop: 36,
    paddingBottom: 8,
  },
  img: {
    height: 136,
    width: 263,
    alignSelf: 'center',
    marginVertical: 32,
    marginHorizontal: 16,
  },
  button: {
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
  },
});
