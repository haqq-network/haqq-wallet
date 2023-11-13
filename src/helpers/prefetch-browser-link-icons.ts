import {Image} from 'react-native';

import {getFavIconUrl} from '@app/helpers/web3-browser-utils';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Link} from '@app/types';

export async function prefetchBrowserLinkIcons() {
  try {
    return await Promise.allSettled(
      [
        ...Web3BrowserBookmark.getAll(),
        ...Web3BrowserSearchHistory.getAll(),
      ].map((link: Link) =>
        Image.prefetch(link.icon || getFavIconUrl(link.url)),
      ),
    );
  } catch (err) {
    Logger.error('prefetchBrowserLinkIcons Image.prefetch error', err);
  }
}
