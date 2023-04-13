import url from 'url';

import {onBannerAddClaimCode} from '@app/event-actions/on-banner-add-claim-code';
import {Refferal} from '@app/models/refferal';
import {DynamicLink} from '@app/types';

export async function onDynamicLink(link: DynamicLink | null) {
  if (link && 'url' in link) {
    const parsedUrl = url.parse(link.url, true);

    if (parsedUrl.query.claim_code) {
      Refferal.create({code: parsedUrl.query.claim_code as string});

      await onBannerAddClaimCode(parsedUrl.query.claim_code as string);
    }
  }
}
