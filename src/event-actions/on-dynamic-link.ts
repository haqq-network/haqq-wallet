import {Refferal} from '@app/models/refferal';
import {DynamicLink} from '@app/types';

const url = require('url');

export async function onDynamicLink(link: DynamicLink | null) {
  if (link && 'url' in link) {
    const parsedUrl = url.parse(link.url, true);

    if (parsedUrl.query.ref) {
      Refferal.create({code: parsedUrl.query.claim_code});
    }
  }
}
