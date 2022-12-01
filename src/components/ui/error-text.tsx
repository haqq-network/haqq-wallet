import * as React from 'react';

import {Color, getColor} from '@app/colors';
import {Text, TextProps} from '@app/components/ui';

type ErrorTextProps = {
  e0?: boolean;
  e1?: boolean;
  e2?: boolean;
  e3?: boolean;
} & TextProps;

export const ErrorText = ({
  e0,
  e1,
  e2,
  e3,
  style,
  ...props
}: ErrorTextProps) => {
  return (
    <Text
      t10={e0}
      t14={e1}
      t11={e2}
      t8={e3}
      color={getColor(Color.textRed1)}
      style={style}
      {...props}
    />
  );
};
