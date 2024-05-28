import React, {ReactNode} from 'react';

import {I18nManager} from 'react-native';

export type Props = {children: ReactNode[]};

export const RTLReverse = ({children}: Props) => {
  return <>{I18nManager.isRTL ? [...children].reverse() : children}</>;
};
