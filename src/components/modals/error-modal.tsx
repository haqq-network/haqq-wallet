import React, {useEffect} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconProps,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, hideModal} from '@app/helpers';
import {HapticEffects, vibrate} from '@app/services/haptic';

export type ErrorModalImage =
  | {
      icon: IconProps['name'];
      color: IconProps['color'];
    }
  | {
      image: string;
    }
  | {};

export type ErrorModalProps = {
  title: string;
  description?: string;
  close: string;
} & ErrorModalImage;

export const ErrorModal = ({
  title,
  description,
  close,
  ...props
}: ErrorModalProps) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  return (
    <BottomPopupContainer>
      {onClose => (
        <View style={page.modalView}>
          <Text t5 center>
            {title}
          </Text>
          {description && (
            <>
              <Spacer height={8} />
              <Text t14 center>
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
            onPress={() => onClose(hideModal)}
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
  button: {
    width: '100%',
  },
});
