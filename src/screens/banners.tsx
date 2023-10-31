import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {Banners} from '@app/components/banners';
import {onBannerAction} from '@app/event-actions/on-banner-action';
import {Banner, BannerButtonEvent} from '@app/models/banner';

export const BannersWrapper = observer(() => {
  const onPressBannerAction = useCallback(
    async (
      id: string,
      event: BannerButtonEvent,
      params: Record<string, any> = {},
    ) => {
      await onBannerAction(id, event, params);
    },
    [],
  );

  return (
    <Banners banners={Banner.banners} onPressBanner={onPressBannerAction} />
  );
});
