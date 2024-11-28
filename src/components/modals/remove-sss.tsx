import React, {useCallback, useEffect, useState} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import {ProviderMnemonicBase, ProviderSSSBase} from '@haqq/rn-wallet-providers';
import {encryptShare, jsonrpcRequest} from '@haqq/shared-react-native';
import {mnemonicToEntropy} from 'bip39';
import {observer} from 'mobx-react';
import {Alert, Image, View} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonVariant,
  Loading,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {
  decryptLocalShare,
  getProviderStorage,
  getSocialLoginProviderForWallet,
} from '@app/helpers/sss';
import {I18N, getText} from '@app/i18n';
import {ErrorHandler} from '@app/models/error-handler';
import {Wallet} from '@app/models/wallet';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {Creds} from '@app/services/provider-sss';
import {
  ShareCreateResponse,
  SharesResponse,
} from '@app/services/provider-sss-initialize';
import {RemoteConfig} from '@app/services/remote-config';
import {ModalType, Modals, WalletType} from '@app/types';

export const RemoveSSS = observer(
  ({onClose, accountId, provider}: Modals[ModalType.removeSSS]) => {
    const [isLoading, setLoading] = useState(false);
    useEffect(() => {
      vibrate(HapticEffects.warning);
    }, []);

    const [ProviderAction, setProviderAction] = useState<
      (() => Promise<Creds | null>) | null
    >(null);

    useEffect(() => {
      if (!ProviderAction) {
        getSocialLoginProviderForWallet({accountId}).then(setProviderAction);
      }
    }, [provider, accountId]);

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
        const storage = await getProviderStorage(accountId, provider);
        const shareKey = `haqq_${accountId.toLowerCase()}`;
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
        if (!ProviderAction) {
          return;
        }
        setLoading(true);
        const creds = await ProviderAction();

        if (creds) {
          if (!creds.privateKey) {
            Logger.error('No Private Key Detected RemoveSSS');
            close();
            return;
          }

          const storage = await getProviderStorage('', provider);
          const getPassword = app.getPassword.bind(app);
          const password = await getPassword();

          Wallet.getAll().forEach(async wallet => {
            if (wallet.type === WalletType.sss) {
              const localShare = await decryptLocalShare(
                creds.privateKey!,
                password,
                wallet.address,
              );

              const sssProvider = await ProviderSSSBase.initialize(
                creds.privateKey,
                null,
                localShare,
                null,
                creds.verifier,
                creds.token,
                getPassword,
                storage,
                {
                  metadataUrl: RemoteConfig.get('sss_metadata_url')!,
                  generateSharesUrl: RemoteConfig.get(
                    'sss_generate_shares_url',
                  )!,
                },
              ).catch(err => ErrorHandler.handle('sss5Y', err));

              const mnemonic = await sssProvider!.getMnemonicPhrase();
              let entropy = mnemonicToEntropy(mnemonic);
              if (entropy.startsWith('0x')) {
                entropy = entropy.slice(2);
              }

              if (entropy.startsWith(''.padStart(64, '0'))) {
                entropy = entropy.slice(64);
              }

              ProviderMnemonicBase.initialize(mnemonic, getPassword, {});

              const share = await encryptShare(
                {
                  share: entropy.padStart(64, '0'),
                  shareIndex: entropy.length.toString(),
                  polynomialID: '0',
                },
                await getPassword(),
              );

              if (share) {
                await EncryptedStorage.setItem(
                  `mnemonic_${wallet.accountId?.toLowerCase()}`,
                  JSON.stringify(share),
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

    if (!ProviderAction) {
      return <Loading />;
    }

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
