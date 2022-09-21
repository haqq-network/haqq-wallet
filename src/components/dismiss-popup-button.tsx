import React from 'react';
import {CloseCircle, IconButton} from './ui';
import {GRAPHIC_SECOND_2} from '../variables';
import {CompositeScreenProps} from '@react-navigation/native';

type DismissPopupButtonProp = CompositeScreenProps<any, any>;

export const DismissPopupButton = ({navigation}: DismissPopupButtonProp) => {
  return (
    <IconButton style={{width: 24, height: 24}} onPress={navigation.goBack}>
      <CloseCircle color={GRAPHIC_SECOND_2} />
    </IconButton>
  );
};
