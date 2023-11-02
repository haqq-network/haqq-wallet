import React, {useCallback, useState} from 'react';

import {Alert} from 'react-native';

import {BrowserEditBookmarks} from '@app/components/browser-edit-bookmarks';
import {useTypedNavigation} from '@app/hooks';
import {useWeb3BrowserBookmark} from '@app/hooks/use-web3-browser-bookmark';
import {I18N, getText} from '@app/i18n';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Link} from '@app/types';

export const BrowserEditBookmarksScreen = () => {
  const navigation = useTypedNavigation();

  const bookmarks = useWeb3BrowserBookmark();
  const [links, setLinks] = useState<Link[]>(
    bookmarks
      .map(item => item?.toJSON?.() as unknown as Link)
      ?.filter(item => !!item),
  );

  const onDragEnd = useCallback((newLinks: Link[]) => {
    setLinks(newLinks);
  }, []);

  const onPressRemove = useCallback((link: Link) => {
    const remove = () => {
      setLinks(data => data?.filter?.(it => it.id !== link.id));
      Web3BrowserBookmark.remove(link.id);
    };

    Alert.alert(getText(I18N.editBookmarksRemoveAlert), undefined, [
      {
        text: getText(I18N.cancel),
        style: 'cancel',
      },
      {
        text: getText(I18N.delete),
        style: 'destructive',
        onPress: remove,
      },
    ]);
  }, []);

  const onPressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onPressSubmit = useCallback(() => {
    links.forEach((link, index) => {
      Web3BrowserBookmark.getById(link.id)?.update({
        order: index,
      });
    });
    navigation.goBack();
  }, [links, navigation]);

  return (
    <BrowserEditBookmarks
      links={links}
      onPressRemove={onPressRemove}
      onDragEnd={onDragEnd}
      onPressBack={onPressBack}
      onPressSubmit={onPressSubmit}
    />
  );
};
