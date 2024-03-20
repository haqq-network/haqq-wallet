import Config from 'react-native-config';

import {onBannerAddClaimCode} from '@app/event-actions/on-banner-add-claim-code';
import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {Refferal} from '@app/models/refferal';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {Airdrop} from '@app/services/airdrop';
import {EventTracker} from '@app/services/event-tracker';
import {RemoteConfig} from '@app/services/remote-config';
import {MarketingEvents} from '@app/types';

export async function onBannerGasdropCreate() {
  const taken = VariablesBool.get('gasdropTaken');

  if (taken || Wallet.getAllVisible().length === 0) {
    return;
  }

  try {
    const account = await getLeadingAccount();

    if (!account) {
      return;
    }

    const adid = await EventTracker.instance.getAdid();

    const link_info = await Airdrop.instance.gasdrop_code(
      RemoteConfig.get_env(
        'airdrop_gasdrop_campaign_id',
        Config.AIRDROP_GASDROP_CAMPAIGN_ID,
      ),
      RemoteConfig.get_env(
        'airdrop_gasdrop_secret',
        Config.AIRDROP_GASDROP_SECRET,
      ),
      account.address,
      adid,
    );

    if (!link_info.code) {
      throw new Error('No code');
    }

    const info = await Airdrop.instance.campaign_code(link_info.code);

    const exists = Refferal.getById(link_info.code as string);

    if (
      !exists &&
      (info.code_type === 'airdrop' || info.code_type === 'raffle')
    ) {
      Refferal.create({
        code: link_info.code as string,
        wallet: info.wallet,
      });
      await onBannerAddClaimCode(link_info.code as string);
      EventTracker.instance.trackEvent(MarketingEvents.claimCreated, {
        claimCode: link_info.code as string,
      });
    }
  } catch (e) {
    Logger.captureException(e, 'onBannerGasdropCreate');
  } finally {
    VariablesBool.set('gasdropTaken', true);
  }
}
