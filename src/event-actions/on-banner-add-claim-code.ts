import {Banner} from '@app/models/banner';
import {Airdrop} from '@app/services/airdrop';

export async function onBannerAddClaimCode(claimCode: string) {
  const info = await Airdrop.instance.info(claimCode);

  if (!info.available) {
    Banner.remove(claimCode);
  } else {
    Banner.create({
      id: claimCode,
      title: info.title,
      description: info.text,
      buttons: [
        {
          id: new Realm.BSON.UUID(),
          title: info.button_text,
          event: 'claimCode',
          params: {
            claim_code: claimCode,
          },
          color: info.button_text_color,
          backgroundColor: info.button_background_color,
        },
      ],
      backgroundColorFrom: info.background_color_from,
      backgroundColorTo: info.background_color_to,
    });
  }
}
