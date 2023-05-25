import url from 'url';

import {onBannerAddClaimCode} from '@app/event-actions/on-banner-add-claim-code';
import {Refferal} from '@app/models/refferal';
import {Airdrop} from '@app/services/airdrop';
import {DynamicLink} from '@app/types';

export async function onDynamicLink(link: DynamicLink | null) {
  if (link && 'url' in link) {
    const parsedUrl = url.parse(link.url, true);

    if (parsedUrl.query.claim_code) {
      const exists = Refferal.getById(parsedUrl.query.claim_code as string);

      if (!exists) {
        Refferal.create({code: parsedUrl.query.claim_code as string});
        await onBannerAddClaimCode(parsedUrl.query.claim_code as string);
      }
    }

    if (parsedUrl.query.campaign_code) {
      const info = await Airdrop.instance.campaign_code(
        parsedUrl.query.campaign_code as string,
      );

      const exists = Refferal.getById(parsedUrl.query.claim_code as string);

      if (!exists && info.code_type === 'airdrop') {
        Refferal.create({code: parsedUrl.query.campaign as string});
        await onBannerAddClaimCode(parsedUrl.query.campaign as string);
      }
    }
  }
}
