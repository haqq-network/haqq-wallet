import url from 'url';

import {BSON} from 'realm';

import {Color} from '@app/colors';
import {showModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {Airdrop} from '@app/services/airdrop';
import {DynamicLink} from '@app/types';

export async function onDynamicLink(link: DynamicLink | null) {
  if (link && 'url' in link) {
    const parsedUrl = url.parse(link.url, true);

    if (parsedUrl.query.claim_code) {
      try {
        const info = await Airdrop.instance.info(
          parsedUrl.query.claim_code as string,
        );

        if (!info.available) {
          throw new Error(info.unavalible_reason);
        }

        Banner.create({
          snoozedUntil: undefined,
          id: parsedUrl.query.claim_code as string,
          title: info.airdrop_title,
          description: info.airdrop_text,
          buttons: [
            {
              id: new BSON.ObjectId(),
              title: info.airdrop_button_text,
              event: 'claimCode',
              params: {
                claim_code: parsedUrl.query.claim_code as string,
              },
              color: info.airdrop_button_text_color,
              backgroundColor: info.airdrop_button_background_color,
            },
          ],
          backgroundColorFrom: info.airdrop_button_background_color,
          backgroundColorTo: info.airdrop_button_background_color,
        });
      } catch (e) {
        if (e instanceof Error) {
          showModal('error', {
            title: getText(I18N.modalRewardErrorTitle),
            description: e.message,
            close: getText(I18N.modalRewardErrorClose),
            icon: 'reward_error',
            color: Color.graphicSecond4,
          });
        }
      }
    }
  }
}
