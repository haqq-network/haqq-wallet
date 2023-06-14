import React, {useEffect} from 'react';

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
import {createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {Modals} from '@app/types';

export const DomainBlocked = ({onClose, domain}: Modals['domainBlocked']) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  const imageSource = useThemeSelector({
    dark: require('@assets/images/domain-blocked-dark.png'),
    light: require('@assets/images/domain-blocked-light.png'),
  });

  return (
    <BottomPopupContainer>
      {onCloseModal => (
        <View style={page.modalView}>
          <Text t5 center i18n={I18N.domainBlockedTitle} />
          <Spacer height={8} />
          <Text t14 center>
            {getText(I18N.domainBlockedDescription1)}
            <Text t13>{domain}</Text>
            {getText(I18N.domainBlockedDescription2)}
          </Text>
          <Spacer height={32} />
          <Image source={imageSource} style={page.image} />
          <Spacer height={32} />
          <Button
            i18n={I18N.bluetoothUnauthorizedClose}
            onPress={() => onCloseModal(onClose)}
            variant={ButtonVariant.second}
            style={page.button}
            size={ButtonSize.middle}
          />
        </View>
      )}
    </BottomPopupContainer>
  );
};

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
    height: 109,
  },
});
