import url from 'url';

import {onBannerAddClaimCode} from '@app/event-actions/on-banner-add-claim-code';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Refferal} from '@app/models/refferal';
import {Airdrop} from '@app/services/airdrop';
import {AdjustEvents, DynamicLink} from '@app/types';

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

      const exists = Refferal.getById(parsedUrl.query.campaign_code as string);

      if (
        !exists &&
        (info.code_type === 'airdrop' || info.code_type === 'raffle')
      ) {
        Refferal.create({
          code: parsedUrl.query.campaign_code as string,
          wallet: info.wallet,
        });
        await onBannerAddClaimCode(parsedUrl.query.campaign_code as string);
        onTrackEvent(AdjustEvents.claimCreated, {
          claimCode: parsedUrl.query.campaign_code as string,
        });
      }
    }
  }
}
