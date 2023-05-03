import {useCallback, useEffect, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {News as NewsComponent} from '@app/components/news';
import {useTypedNavigation} from '@app/hooks';
import {News} from '@app/models/news';
import {VariablesBool} from '@app/models/variables-bool';

export const NewsListScreen = () => {
  const navigation = useTypedNavigation();
  const [rows, setRows] = useState(
    News.getAll()
      .filtered('status = "published"')
      .sorted('publishedAt', true)
      .snapshot(),
  );
  useEffect(() => {
    VariablesBool.set('isNewNews', false);

    const onChange = (
      collection: Collection<News>,
      changes: CollectionChangeSet,
    ) => {
      if (
        changes.insertions.length ||
        changes.newModifications.length ||
        changes.deletions.length
      ) {
        setRows(
          News.getAll()
            .filtered('status = "published"')
            .sorted('publishedAt', true)
            .snapshot(),
        );
      }
    };

    News.getAll().addListener(onChange);

    return () => {
      News.getAll().removeListener(onChange);
    };
  }, []);

  const onPressRow = useCallback(
    (id: string) => {
      navigation.navigate('newsDetail', {
        id,
      });
    },
    [navigation],
  );

  return <NewsComponent rows={rows} onPress={onPressRow} />;
};
