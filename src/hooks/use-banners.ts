import {useEffect, useMemo, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {Banner} from '@app/models/banner';

export const useBanners = () => {
  const banners = useMemo(() => Banner.getAvailable(), []);
  const [_, setUpdated] = useState(+new Date());

  useEffect(() => {
    const listener = (
      collection: Collection<Banner>,
      changes: CollectionChangeSet,
    ) => {
      if (
        changes.insertions.length ||
        changes.newModifications.length ||
        changes.deletions.length
      ) {
        setUpdated(+new Date());
      }
    };

    banners.addListener(listener);

    return () => {
      banners.removeListener(listener);
    };
  }, [banners]);

  return banners.snapshot();
};
