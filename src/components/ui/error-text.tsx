import React from 'react';

import {View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Button, ButtonVariant, Text, TextProps} from '@app/components/ui';
import {createTheme, showModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {ModalType} from '@app/types';

type ErrorTextProps = {
  e0?: boolean;
  e1?: boolean;
  e2?: boolean;
  e3?: boolean;
  errorDetails?: string;
} & TextProps;

export const ErrorText = ({
  e0,
  e1,
  e2,
  e3,
  errorDetails,
  style,
  ...props
}: ErrorTextProps) => {
  return (
    <View style={styles.container}>
      <Text
        t10={e0}
        t14={e1}
        t11={e2}
        t8={e3}
        color={getColor(Color.textRed1)}
        style={style}
        {...props}
      />
      {Boolean(errorDetails) && (
        <Button
          variant={ButtonVariant.text}
          title={getText(I18N.viewDetailsTitle)}
          onPress={() => {
            showModal(ModalType.viewErrorDetails, {
              errorDetails: errorDetails!,
            });
          }}
        />
      )}
    </View>
  );
};

const styles = createTheme({
  container: {alignItems: 'center'},
});
