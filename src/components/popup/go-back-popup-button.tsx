import React from 'react';

import {useNavigation} from '@react-navigation/native';

import {Color} from '@app/colors';
import {Icon, IconButton} from '@app/components/ui';
import {DEFAULT_HITSLOP} from '@app/variables/common';

export const GoBackPopupButton = () => {
  const navigation = useNavigation();
  return (
    <IconButton onPress={navigation.goBack} hitSlop={DEFAULT_HITSLOP}>
      <Icon i24 name="arrow_back" color={Color.graphicBase1} />
    </IconButton>
  );
};
