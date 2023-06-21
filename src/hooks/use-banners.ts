import {useEffect, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {Banner} from '@app/models/banner';

export const useBanners = () => {
  const [banners, setBanners] = useState(Banner.getAvailable().snapshot());

  useEffect(() => {
    const handler = Banner.getAvailable();

    const listener = (
      collection: Collection<Banner>,
      changes: CollectionChangeSet,
    ) => {
      if (
        changes.insertions.length ||
        changes.newModifications.length ||
        changes.deletions.length
      ) {
        setBanners(Banner.getAvailable().snapshot());
      }
    };

    handler.addListener(listener);

    return () => {
      handler.removeListener(listener);
    };
  }, []);

  return banners;
};
