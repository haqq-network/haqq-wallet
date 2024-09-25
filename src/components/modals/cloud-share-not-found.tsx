import React, {useCallback, useEffect} from 'react';

import {ProviderSSSBase} from '@haqq/rn-wallet-providers';
import {observer} from 'mobx-react';
import {Image, Platform, View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Spacer,
  Text,
} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme, hideModal} from '@app/helpers';
import {decryptLocalShare} from '@app/helpers/decrypt-local-share';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {getMetadataValueWrapped} from '@app/helpers/wrappers/get-metadata-value';
import {I18N} from '@app/i18n';
import {ErrorHandler} from '@app/models/error-handler';
import {Wallet} from '@app/models/wallet';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {onLoginApple, onLoginGoogle} from '@app/services/provider-sss';
import {RemoteConfig} from '@app/services/remote-config';
import {ModalType, Modals} from '@app/types';

export const CloudShareNotFound = observer(
  ({onClose, wallet}: Modals[ModalType.cloudShareNotFound]) => {
    useEffect(() => {
      vibrate(HapticEffects.error);
    }, []);

    const generateNewShares = useCallback(async () => {
      try {
        const getPasswordPromise = app.getPassword.bind(app);
        const password = await getPasswordPromise();

        const provider =
          Platform.OS === 'android' ? onLoginGoogle : onLoginApple;

        const creds = await provider();

        if (creds) {
          if (!creds.privateKey) {
            throw new Error('No Private Key Detected');
          }

          const walletInfo = await getMetadataValueWrapped(
            RemoteConfig.get('sss_metadata_url')!,
            creds.privateKey,
            'socialShareIndex',
          );

          if (!walletInfo) {
            throw new Error('No Wallet Info Detected');
          }

          const localShare = await decryptLocalShare(
            creds.privateKey,
            password,
          );
          const storage = await getProviderStorage('', 'cloud');

          await ProviderSSSBase.initialize(
            creds.privateKey,
            null,
            localShare,
            null,
            creds.verifier,
            creds.token,
            getPasswordPromise,
            storage,
            {
              metadataUrl: RemoteConfig.get('sss_metadata_url')!,
              generateSharesUrl: RemoteConfig.get('sss_generate_shares_url')!,
            },
          ).catch(err => {
            ErrorHandler.handle('sssLimitReached', err);
          });

          if (wallet?.address) {
            Wallet.update(wallet.address, {socialLinkEnabled: true});
          }
        }

        hideModal(ModalType.cloudShareNotFound);
      } catch (err) {
        if (err instanceof Error) {
          Logger.log('CloudShareNotFound Error: ', err.message);
        }
      }
    }, []);

    return (
      <BottomPopupContainer>
        {onCloseModal => (
          <View style={page.modalView}>
            <Text t5 center i18n={I18N.cloudShareNotFoundTitle} />
            <Spacer height={8} />
            <Text t14 center i18n={I18N.cloudShareNotFoundDescription} />
            <Spacer height={32} />
            <Image
              source={require('@assets/images/cloud-share-not-found.png')}
              style={page.image}
            />
            <Spacer height={32} />
            <Button
              i18n={I18N.cloudShareNotFoundPrimaryButton}
              onPress={generateNewShares}
              variant={ButtonVariant.contained}
              style={page.button}
              size={ButtonSize.middle}
            />
            <Spacer height={16} />
            <Button
              i18n={I18N.cloudShareNotFoundSecondaryButton}
              onPress={() => {
                if (wallet?.address) {
                  Wallet.update(wallet.address, {socialLinkEnabled: false});
                }
                onCloseModal(onClose);
              }}
              variant={ButtonVariant.third}
              style={page.button}
              error
              size={ButtonSize.middle}
            />
          </View>
        )}
      </BottomPopupContainer>
    );
  },
);

const page = createTheme({
  modalView: {
    alignItems: 'center',
    backgroundColor: Color.bg1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
  button: {
    width: '100%',
  },
  image: {
    width: 263,
    height: 140,
  },
});
