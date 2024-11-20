import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import {constants} from '@haqq/rn-wallet-providers';
import {jsonrpcRequest} from '@haqq/shared-react-native';
import {observer} from 'mobx-react';
import {Alert, Image, Platform, View} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

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
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {Creds, onLoginApple, onLoginGoogle} from '@app/services/provider-sss';
import {
  ShareCreateResponse,
  SharesResponse,
} from '@app/services/provider-sss-initialize';
import {RemoteConfig} from '@app/services/remote-config';
import {ModalType, Modals, WalletType} from '@app/types';

export const RemoveSSS = observer(
  ({onClose, accountID, provider}: Modals[ModalType.removeSSS]) => {
    const [isLoading, setLoading] = useState(false);
    useEffect(() => {
      vibrate(HapticEffects.warning);
    }, []);

    const ProviderAction = useMemo(() => {
      if (Platform.OS === 'android') {
        return onLoginGoogle;
      }
      return provider === 'cloud' ? onLoginApple : onLoginGoogle;
    }, [provider]);

    const removeChainShare = async (creds: Creds) => {
      try {
        const generateSharesUrl = RemoteConfig.get('sss_generate_shares_url')!;

        const nodeDetailsRequest = await jsonrpcRequest<SharesResponse>(
          generateSharesUrl,
          'shares',
          [creds.verifier, creds.token, true],
        );
        const info = await accountInfo(creds.privateKey!);

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
      } catch (err) {
        if (err instanceof Error) {
          Logger.warn('RemoveSSS Error (Chain Share): ', err.message);
        }
      }
    };

    const removeCloudShare = async () => {
      try {
        const storage = await getProviderStorage(accountID, provider);
        const shareKey = `haqq_${accountID.toLowerCase()}`;
        await storage.removeItem(shareKey).catch(err => {
          if (err instanceof Error) {
            Logger.warn('Remove SSS Remove Error:', err.message);
          }
        });
      } catch (err) {
        if (err instanceof Error) {
          Logger.warn('RemoveSSS Error (Cloud Share): ', err.message);
        }
      }
    };

    const onPressDelete = async (close: () => void) => {
      try {
        setLoading(true);
        const creds = await ProviderAction();

        if (creds) {
          if (!creds.privateKey) {
            Logger.error('No Private Key Detected RemoveSSS');
            close();
            return;
          }

          Wallet.getAll().forEach(async wallet => {
            if (wallet.type === WalletType.sss) {
              const account = await accountInfo(creds.privateKey as string);
              const share = await EncryptedStorage.getItem(
                `${
                  constants.ITEM_KEYS[constants.WalletType.sss]
                }_${account.address.toLowerCase()}`,
              );
              if (share) {
                await EncryptedStorage.setItem(
                  `mnemonic_${wallet.accountId}`,
                  share,
                );
              }
              Wallet.update(wallet.address, {
                socialLinkEnabled: false,
                type: WalletType.mnemonic,
              });
            }
          });

          await Promise.allSettled([
            removeChainShare(creds),
            removeCloudShare(),
          ]);
        }
      } catch (err) {
        if (err instanceof Error) {
          Logger.warn('RemoveSSS Error: ', err.message);
        }
      } finally {
        setLoading(false);
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
                loading={isLoading}
                loadingColor={Color.textRed1}
              />
            </View>
          </View>
        )}
      </BottomPopupContainer>
    );
  },
);

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
