import React from 'react';

import {useNavigation} from '@react-navigation/native';

import {Icon, IconButton} from '@app/components/ui';
import {Color} from '@app/theme';
import {DEFAULT_HITSLOP} from '@app/variables/common';

type Props = {
  onBack?: () => void;
};

export const GoBackPopupButton = ({onBack}: Props) => {
  const navigation = useNavigation();
  return (
    <IconButton
      onPress={onBack ?? navigation.goBack}
      hitSlop={DEFAULT_HITSLOP}
      testID="go_back">
      <Icon i24 name="arrow_back" color={Color.graphicBase1} />
    </IconButton>
  );
};
