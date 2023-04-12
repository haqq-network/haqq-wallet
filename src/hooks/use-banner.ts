import {useEffect, useMemo, useState} from 'react';

import {Banner} from '@app/models/banner';

export const useBanner = () => {
  const banners = useMemo(() => Banner.getAvailable(), []);
  const [banner, setBanner] = useState<Banner | null>(banners[0] ?? null);

  useEffect(() => {
    const listener = () => {
      setBanner(banners[0] ?? null);
    };

    banners.addListener(listener);

    return () => {
      banners.removeListener(listener);
    };
  }, [banners]);

  return banner;
};
