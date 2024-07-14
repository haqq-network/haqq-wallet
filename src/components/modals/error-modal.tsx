import React, {useEffect} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconButton,
  IconsName,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType, Modals} from '@app/types';

export const ErrorModal = ({
  title,
  description,
  close,
  onClose,
  ...props
}: Modals[ModalType.error]) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  return (
    <BottomPopupContainer>
      {onClosePopup => (
        <View style={page.modalView}>
          <View style={page.header}>
            <IconButton onPress={() => onClosePopup(onClose)}>
              <Icon name={IconsName.close_circle} color={Color.textBase2} i20 />
            </IconButton>
          </View>
          <Text variant={TextVariant.t5} position={TextPosition.center}>
            {title}
          </Text>

          {description && (
            <>
              <Spacer height={8} />
              <Text variant={TextVariant.t14} position={TextPosition.center}>
                {description}
              </Text>
            </>
          )}
          <Spacer height={20} />
          {'icon' in props && (
            <Spacer height={160} centered>
              <Icon name={props.icon} color={props.color} i120 />
            </Spacer>
          )}
          <Spacer height={20} />

          <Button
            onPress={() => onClosePopup(onClose)}
            variant={ButtonVariant.second}
            size={ButtonSize.middle}
            style={page.button}
            title={close}
          />
        </View>
      )}
    </BottomPopupContainer>
  );
};

const page = createTheme({
  modalView: {
    backgroundColor: Color.bg1,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignContent: 'center',
    width: '100%',
    height: 0,
  },
  button: {
    width: '100%',
  },
});
