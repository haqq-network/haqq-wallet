import {AIRDROP_GASDROP_CAMPAIGN_ID, AIRDROP_GASDROP_SECRET} from '@env';

import {onBannerAddClaimCode} from '@app/event-actions/on-banner-add-claim-code';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {captureException} from '@app/helpers';
import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {Refferal} from '@app/models/refferal';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {Airdrop} from '@app/services/airdrop';
import {AdjustEvents} from '@app/types';

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

    const link_info = await Airdrop.instance.gasdrop_code(
      AIRDROP_GASDROP_CAMPAIGN_ID,
      AIRDROP_GASDROP_SECRET,
      account.address,
    );

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
      onTrackEvent(AdjustEvents.claimCreated, {
        claimCode: link_info.code as string,
      });
    }

    VariablesBool.set('gasdropTaken', true);
  } catch (e) {
    captureException(e, 'onBannerGasdropCreate');
  }
}
