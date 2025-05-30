import React, {ReactNode, memo, useCallback, useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {getAppInfo} from '@app/helpers/get-app-info';
import {useLayoutAnimation} from '@app/hooks/use-layout-animation';
import {AppStore} from '@app/models/app';
import {VariablesString} from '@app/models/variables-string';
import {Backend} from '@app/services/backend';
import {IWidget, NftWidgetSize} from '@app/types';
import {generateUUID} from '@app/utils';
import {SwapWidget} from '@app/widgets//swap-widget';
import {AdWidget} from '@app/widgets/ad-widget';
import {BannerWidget} from '@app/widgets/banner-widget';
import {GovernanceWidgetWrapper} from '@app/widgets/governance-widget';
import {LayoutWidgetWrapper} from '@app/widgets/layout-widget';
import {NftWidgetWrapper} from '@app/widgets/nft-widget';
import {RafflesWidgetWrapper} from '@app/widgets/raffles.widget';
import {StakingWidgetWrapper} from '@app/widgets/staking-widget';
import {TokensWidgetWrapper} from '@app/widgets/tokens-widget';
import {TransactionsWidgetWrapper} from '@app/widgets/transactions-widget';

const MOCK_MARKUP: IWidget[] = [
  {
    id: 'home-widget',
    component: 'Layout',
    direction: 'vertical',
    child: [
      {
        component: 'TokenList',
        id: 'tokens-widget',
      },
      {
        component: 'Transactions',
        id: 'transactions-widget',
      },
      {
        component: 'Nft',
        id: 'nft-widget',
        size: NftWidgetSize.small,
      },
      {
        component: 'Governance',
        id: 'governance-widget',
      },
    ],
  },
];

type IWidgetMap = {
  [key in IWidget['component']]: (
    params: Extract<IWidget, {component: key}> & {
      children?: ReactNode[];
      deep?: boolean;
      id?: string;
    },
  ) => ReactNode;
};

function getUUIDForWidget(widget: {id?: string}): string {
  return widget.id ?? generateUUID();
}

const WidgetMap: IWidgetMap = {
  Transactions: params => (
    <TransactionsWidgetWrapper key={getUUIDForWidget(params)} {...params} />
  ),
  TransactionsShort: () => null,
  Raffles: params => (
    <RafflesWidgetWrapper key={getUUIDForWidget(params)} {...params} />
  ),
  Staking: params => (
    <StakingWidgetWrapper key={getUUIDForWidget(params)} {...params} />
  ),
  Governance: params => (
    <GovernanceWidgetWrapper key={getUUIDForWidget(params)} {...params} />
  ),
  Layout: params => (
    <LayoutWidgetWrapper
      key={getUUIDForWidget(params)}
      deep={false}
      children={[]}
      {...params}
    />
  ),
  Ad: params => <AdWidget key={getUUIDForWidget(params)} banner={params} />,
  Banner: params => (
    <BannerWidget key={getUUIDForWidget(params)} banner={params} />
  ),
  TokenList: params => (
    <TokensWidgetWrapper key={getUUIDForWidget(params)} {...params} />
  ),
  Nft: params => (
    <NftWidgetWrapper key={getUUIDForWidget(params)} {...params} />
  ),
  Swap: params => <SwapWidget key={getUUIDForWidget(params)} {...params} />,
};

export const WidgetRoot = memo(({lastUpdate}: {lastUpdate: number}) => {
  const {animate} = useLayoutAnimation();
  const [data, setData] = useState<IWidget[] | null>();

  const requestMarkup = useCallback(async () => {
    if (AppStore.isRpcOnly) {
      return setData(MOCK_MARKUP);
    }

    const cached = VariablesString.get('widget_blocks');
    if (cached && !data) {
      animate();
      setData(JSON.parse(cached));
    }

    const appInfo = await getAppInfo();
    const response = await Backend.instance.markup('home', appInfo);

    if (!response.blocks) {
      return Logger.error('widget request: not found blocks', response);
    }

    const blocks = [response.blocks];

    const blocksAreEqual = JSON.stringify(blocks) === JSON.stringify(data);

    if (!blocksAreEqual) {
      animate();
      setData(blocks);
      VariablesString.set('widget_blocks', JSON.stringify(blocks));
    }
  }, [data, animate]);

  useEffect(() => {
    requestMarkup();
    app.on(Events.onRequestMarkup, requestMarkup);
    return () => {
      app.off(Events.onRequestMarkup, requestMarkup);
    };
  }, [lastUpdate, requestMarkup]);

  if (!data) {
    return null;
  }

  const renderWidgetsList = (
    widgets: IWidget[],
    deep: boolean = false,
  ): ReactNode[] => {
    return widgets.map(widget => {
      const component = WidgetMap[widget.component];
      if (!component) {
        return null;
      }

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

  return renderWidgetsList(data);
});
