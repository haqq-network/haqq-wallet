import React, {ReactNode, memo, useState} from 'react';

import {getUid} from '@app/helpers/get-uid';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {Wallet} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {IWidget} from '@app/types';
import {generateUUID} from '@app/utils';
import {AdWidget} from '@app/widgets/ad-widget';
import {BannerWidget} from '@app/widgets/banner-widget';
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
  Ad: params => <AdWidget key={generateUUID()} banner={params} />,
  Banner: params => <BannerWidget key={generateUUID()} banner={params} />,
};

export const WidgetRoot = memo(({forceUpdate}: {forceUpdate: object}) => {
  const [data, setData] = useState<IWidget[]>([]);

  useEffectAsync(async () => {
    const wallets = Wallet.getAll().map(wallet => wallet.address.toLowerCase());
    const uid = await getUid();
    const response = await Backend.instance.markup({
      wallets,
      screen: 'home',
      uid,
    });
    if (response.blocks) {
      setData([response.blocks]);
    }
  }, [forceUpdate]);

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

  //@ts-ignore
  return renderWidgetsList(data);
});
