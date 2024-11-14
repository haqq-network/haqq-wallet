import url from 'url';

import {onBannerAddClaimCode} from '@app/event-actions/on-banner-add-claim-code';
import {showModal} from '@app/helpers';
import {Refferal} from '@app/models/refferal';
import {VariablesString} from '@app/models/variables-string';
import {Whitelist} from '@app/models/whitelist';
import {Airdrop} from '@app/services/airdrop';
import {EventTracker} from '@app/services/event-tracker';
import {DynamicLink, MarketingEvents, ModalType} from '@app/types';
import {openInAppBrowser, openWeb3Browser} from '@app/utils';

export async function onDynamicLink(link: Partial<DynamicLink> | null) {
  Logger.log('onDynamicLink', JSON.stringify(link, null, 2));
  if (link && 'url' in link) {
    const parsedUrl = url.parse(link.url!, true);
    Logger.log('onDynamicLink parsedUrl', JSON.stringify(parsedUrl, null, 2));

    if (typeof parsedUrl?.query?.distinct_id === 'string') {
      await EventTracker.instance.awaitForInitialization();
      EventTracker.instance.posthog?.identify(parsedUrl.query.distinct_id);
    }

    if (typeof parsedUrl?.query?.block_code === 'string') {
      VariablesString.set('block_code', parsedUrl.query.block_code);
    }

    if (typeof parsedUrl?.query?.browser === 'string') {
      if (await Whitelist.checkUrl(parsedUrl?.query?.browser)) {
        let uri = parsedUrl?.query?.browser!;
        for (const key in parsedUrl.query) {
          if (key !== 'browser') {
            uri += `&${key}=${parsedUrl.query[key]}`;
          }
        }
        openInAppBrowser(uri as string);
      } else {
        showModal(ModalType.domainBlocked, {
          domain: parsedUrl.query.browser!,
        });
      }
    }

    if (typeof parsedUrl?.query?.web3_browser === 'string') {
      if (await Whitelist.checkUrl(parsedUrl?.query?.web3_browser)) {
        let uri = parsedUrl?.query?.web3_browser!;
        for (const key in parsedUrl.query) {
          if (key !== 'web3_browser') {
            uri += `&${key}=${parsedUrl.query[key]}`;
          }
        }

        openWeb3Browser(uri);
      } else {
        showModal(ModalType.domainBlocked, {
          domain: parsedUrl.query.web3_browser!,
        });
      }
    }

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
        EventTracker.instance.trackEvent(MarketingEvents.claimCreated, {
          claimCode: parsedUrl.query.campaign_code as string,
        });
      }
    }
  }
}
