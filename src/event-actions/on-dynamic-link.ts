import url from 'url';

import {Refferal} from '@app/models/refferal';
import {DynamicLink} from '@app/types';

export async function onDynamicLink(link: DynamicLink | null) {
  if (link && 'url' in link) {
    const parsedUrl = url.parse(link.url, true);

    if (parsedUrl.query.claim_code) {
      Refferal.create({code: parsedUrl.query.claim_code as string});
    }
  }
}
