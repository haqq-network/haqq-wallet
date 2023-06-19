import {Image} from 'react-native';

import {Banner} from '@app/models/banner';
import {Refferal} from '@app/models/refferal';
import {Airdrop} from '@app/services/airdrop';

export async function onBannerAddClaimCode(claimCode: string) {
  const info = await Airdrop.instance.info(claimCode);

  if (!info.available) {
    const ref = Refferal.getById(claimCode);

    if (ref) {
      ref.update({
        isUsed: true,
      });
    }

    Banner.remove(claimCode);
  } else {
    if (info.background_image_url) {
      await Image.prefetch(info.background_image_url);
    }

    Banner.create({
      id: claimCode,
      title: info.title,
      description: info.description,
      type: 'claimCode',
      buttons: [
        {
          id: new Realm.BSON.UUID(),
          title: info.button_title,
          event: 'claimCode',
          params: {
            claim_code: claimCode,
          },
          color: info.button_color,
          backgroundColor: info.button_background_color,
        },
      ],
      backgroundColorFrom: info.background_color_from,
      backgroundColorTo: info.background_color_to,
      backgroundImage: info.background_image_url,
      priority: 100,
    });
  }
}
