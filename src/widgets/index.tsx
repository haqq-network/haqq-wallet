import React, {ReactNode, memo} from 'react';

import {IWidget} from '@app/types';
import {generateUUID} from '@app/utils';
import {GovernanceWidgetWrapper} from '@app/widgets/governance-widget';
import {LayoutWidgetWrapper} from '@app/widgets/layout-widget';
import {RafflesWidgetWrapper} from '@app/widgets/raffles.widget';
import {StakingWidgetWrapper} from '@app/widgets/staking-widget';
import {TransactionsShortWidgetWrapper} from '@app/widgets/transactions-short-widget';
import {TransactionsWidgetWrapper} from '@app/widgets/transactions-widget';

type IWidgetMap = {
  [key in IWidget['component']]: (
    params: Extract<IWidget, {component: key}> & {
      children?: ReactNode[];
      deep?: boolean;
    },
  ) => ReactNode;
};

const WidgetMap: IWidgetMap = {
  Transactions: params => (
    <TransactionsWidgetWrapper key={generateUUID()} {...params} />
  ),
  TransactionsShort: params => (
    <TransactionsShortWidgetWrapper key={generateUUID()} {...params} />
  ),
  Raffles: params => <RafflesWidgetWrapper key={generateUUID()} {...params} />,
  Staking: params => <StakingWidgetWrapper key={generateUUID()} {...params} />,
  Governance: params => (
    <GovernanceWidgetWrapper key={generateUUID()} {...params} />
  ),
  Layout: params => (
    <LayoutWidgetWrapper
      key={generateUUID()}
      deep={false}
      children={[]}
      {...params}
    />
  ),
  Ad: () => null,
  Banner: () => null,
};

export const WidgetRoot = memo(() => {
  const data = MOCK_DATA;
  if (!data) {
    return null;
  }

  const renderWidgetsList = (
    widgets: IWidget[],
    deep: boolean = false,
  ): ReactNode[] => {
    return widgets.map(widget => {
      const component = WidgetMap[widget.component];

      if (widget.component === 'Layout') {
        const layoutComponent = WidgetMap[widget.component as 'Layout'];
        return layoutComponent({
          ...widget,
          deep,
          children: renderWidgetsList(widget.child, true),
        });
      }

      //@ts-ignore
      return component(widget);
    });
  };

  //@ts-ignore
  return renderWidgetsList(data);
});

const MOCK_DATA = [
  {
    component: 'Layout',
    direction: 'vertical',
    child: [
      {
        component: 'TransactionsShort',
      },
      {
        component: 'Transactions',
      },
      {
        component: 'Raffles',
      },
      {
        component: 'Staking',
      },
      {
        component: 'Governance',
      },
      {
        component: 'Layout',
        direction: 'horizontal',
        child: [
          {
            component: 'Governance',
          },
          {
            component: 'Governance',
          },
        ],
      },
    ],
  },
];
