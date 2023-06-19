import React, {useCallback} from 'react';

import {Banners} from '@app/components/banners';
import {onBannerAction} from '@app/event-actions/on-banner-action';
import {useBanners} from '@app/hooks/use-banners';

export const BannersWrapper = () => {
  const banners = useBanners();

  const onPressBannerAction = useCallback(
    async (id: string, event: string, params: Record<string, any> = {}) => {
      await onBannerAction(id, event, params);
    },
    [],
  );

  return <Banners banners={banners} onPressBanner={onPressBannerAction} />;
};
