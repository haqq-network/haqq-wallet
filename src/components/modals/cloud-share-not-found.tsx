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
import {AppStore} from '@app/models/app';
import {ErrorHandler} from '@app/models/error-handler';
import {Wallet} from '@app/models/wallet';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {onLoginApple, onLoginGoogle} from '@app/services/provider-sss';
import {RemoteConfig} from '@app/services/remote-config';
import {ModalType, Modals} from '@app/types';

const logger = Logger.create('CloudShareNotFound', {
  enabled: __DEV__ || app.isTesterMode || AppStore.isDeveloperModeEnabled,
});

export const CloudShareNotFound = observer(
  ({onClose, wallet}: Modals[ModalType.cloudShareNotFound]) => {
    logger.log('CloudShareNotFound: Component rendering', {onClose, wallet});

    useEffect(() => {
      logger.log('CloudShareNotFound: useEffect for vibration');
      vibrate(HapticEffects.error);
      logger.log('CloudShareNotFound: Vibration effect triggered');
    }, []);

    const generateNewShares = useCallback(async () => {
      logger.log('CloudShareNotFound: generateNewShares callback initiated');
      try {
        logger.log('CloudShareNotFound: Getting password promise');
        const getPasswordPromise = app.getPassword.bind(app);
        logger.log('CloudShareNotFound: Awaiting password');
        const password = await getPasswordPromise();
        logger.log('CloudShareNotFound: Password retrieved');

        logger.log(
          'CloudShareNotFound: Determining login provider based on platform',
        );
        const provider =
          Platform.OS === 'android' ? onLoginGoogle : onLoginApple;

        logger.log('CloudShareNotFound: Initiating login process');
        const creds = await provider();
        logger.log('CloudShareNotFound: Login completed', {
          credsReceived: !!creds,
        });

        if (creds) {
          logger.log(
            'CloudShareNotFound: Credentials received, checking private key',
          );
          if (!creds.privateKey) {
            logger.error('CloudShareNotFound: No Private Key Detected');
            throw new Error('No Private Key Detected');
          }

          logger.log('CloudShareNotFound: Fetching wallet info from metadata');
          const walletInfo = await getMetadataValueWrapped(
            RemoteConfig.get('sss_metadata_url')!,
            creds.privateKey,
            'socialShareIndex',
          );
          logger.log('CloudShareNotFound: Wallet info fetched', {
            walletInfoReceived: !!walletInfo,
          });

          if (!walletInfo) {
            logger.error('CloudShareNotFound: No Wallet Info Detected');
            throw new Error('No Wallet Info Detected');
          }

          logger.log('CloudShareNotFound: Decrypting local share');
          const localShare = await decryptLocalShare(
            creds.privateKey,
            password,
          );
          logger.log('CloudShareNotFound: Local share decrypted');

          logger.log('CloudShareNotFound: Getting provider storage');
          const storage = await getProviderStorage('', 'cloud');
          logger.log('CloudShareNotFound: Provider storage retrieved');

          logger.log('CloudShareNotFound: Initializing ProviderSSSBase');
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
            logger.error(
              'CloudShareNotFound: Error in ProviderSSSBase initialization',
              {error: err},
            );
            ErrorHandler.handle('sssLimitReached', err);
          });
          logger.log('CloudShareNotFound: ProviderSSSBase initialized');

          if (wallet?.address) {
            logger.log('CloudShareNotFound: Updating wallet', {
              address: wallet.address,
            });
            Wallet.update(wallet.address, {socialLinkEnabled: true});
            logger.log('CloudShareNotFound: Wallet updated');
          }
        }

        logger.log('CloudShareNotFound: Hiding modal');
        hideModal(ModalType.cloudShareNotFound);
        logger.log('CloudShareNotFound: Modal hidden');
      } catch (err) {
        if (err instanceof Error) {
          logger.error('CloudShareNotFound Error: ', err.message);
        }
      }
    }, []);

    logger.log('CloudShareNotFound: Rendering component');
    return (
      <BottomPopupContainer>
        {onCloseModal => {
          logger.log(
            'CloudShareNotFound: Rendering BottomPopupContainer content',
          );
          return (
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
                  logger.log('CloudShareNotFound: Secondary button pressed');
                  if (wallet?.address) {
                    logger.log('CloudShareNotFound: Updating wallet', {
                      address: wallet.address,
                    });
                    Wallet.update(wallet.address, {socialLinkEnabled: false});
                    logger.log('CloudShareNotFound: Wallet updated');
                  }
                  logger.log('CloudShareNotFound: Closing modal');
                  onCloseModal(onClose);
                }}
                variant={ButtonVariant.third}
                style={page.button}
                error
                size={ButtonSize.middle}
              />
            </View>
          );
        }}
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
