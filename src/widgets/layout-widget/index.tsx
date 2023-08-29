import React, {ReactNode, memo} from 'react';

import {ILayoutWidget} from '@app/types';
import {LayoutWidget} from '@app/widgets/layout-widget/layout-widget';

export const LayoutWidgetWrapper = memo(
  (props: ILayoutWidget & {children: ReactNode[]; deep: boolean}) => {
    return (
      <LayoutWidget
        deep={props.deep}
        direction={props.direction}
        children={props.children}
      />
    );
  },
);
