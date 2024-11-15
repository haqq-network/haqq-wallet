import React, {useCallback, useEffect} from 'react';

import {observer} from 'mobx-react';
import {Image, View} from 'react-native';

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
import {createTheme, hideModal, showModal} from '@app/helpers';
import {generateNewSharesForWallet} from '@app/helpers/sss/generate-new-shares';
import {I18N} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {Wallet} from '@app/models/wallet';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType, Modals} from '@app/types';

const logger = Logger.create('CloudShareNotFound', {
  enabled:
    __DEV__ || AppStore.isTesterModeEnabled || AppStore.isDeveloperModeEnabled,
});

export const CloudShareNotFound = observer(
  ({onClose, wallet}: Modals[ModalType.cloudShareNotFound]) => {
    useEffect(() => {
      vibrate(HapticEffects.error);
    }, []);

    const onPressGenerateNewShares = useCallback(() => {
      const closeLoading = showModal(ModalType.loading);
      generateNewSharesForWallet(wallet).finally(() => {
        closeLoading();
        hideModal(ModalType.cloudShareNotFound);
        onClose?.();
      });
    }, [wallet]);

    const onPressClose = useCallback(() => {
      if (wallet?.address) {
        Wallet.update(wallet.address, {socialLinkEnabled: false});
      }
      hideModal(ModalType.cloudShareNotFound);
      onClose?.();
    }, [wallet]);

    return (
      <BottomPopupContainer>
        {() => (
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
              onPress={onPressGenerateNewShares}
              variant={ButtonVariant.contained}
              style={page.button}
              size={ButtonSize.middle}
            />
            <Spacer height={16} />
            <Button
              i18n={I18N.cloudShareNotFoundSecondaryButton}
              onPress={onPressClose}
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
