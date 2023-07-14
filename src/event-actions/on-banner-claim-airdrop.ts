import {Color} from '@app/colors';
import {CaptchaType} from '@app/components/captcha';
import {app} from '@app/contexts';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {
  awaitForWallet,
  getProviderInstanceForWallet,
  showModal,
} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {I18N, getText} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {Provider} from '@app/models/provider';
import {Refferal} from '@app/models/refferal';
import {Wallet} from '@app/models/wallet';
import {sendNotification} from '@app/services';
import {Airdrop, AirdropError, AirdropErrorCode} from '@app/services/airdrop';
import {AdjustEvents} from '@app/types';

export async function onBannerClaimAirdrop(claimCode: string) {
  const banner = Banner.getById(claimCode);
  try {
    if (!banner) {
      throw new Error('Claim not found');
    }

    const visible = Wallet.getAllVisible();

    let walletId;

    const referral = Refferal.getById(claimCode);

    onTrackEvent(AdjustEvents.claimOpened, {
      claimCode: claimCode,
    });

    try {
      walletId = await awaitForWallet({
        wallets: visible.snapshot(),
        title: I18N.stakingDelegateAccountTitle,
        suggestedAddress: referral?.wallet,
      });
    } catch (e) {
      return;
    }
    const captchaKey = await awaitForCaptcha({
      type: CaptchaType.slider,
    });

    const wallet = Wallet.getById(walletId);

    if (!wallet) {
      throw new Error('wallet not found');
    }

    const walletProvider = await getProviderInstanceForWallet(wallet!);

    const signature = await walletProvider.signPersonalMessage(
      wallet.path!,
      claimCode,
    );

    await Airdrop.instance.claim(walletId, signature, claimCode, captchaKey);

    banner.update({
      isUsed: true,
    });

    onTrackEvent(AdjustEvents.claimFetched, {
      claimCode: claimCode,
    });

    if (referral) {
      const provider = Provider.getById(app.providerId);

      const info = await Airdrop.instance.campaign_code(claimCode);

      if (
        provider?.id !== '6d83b352-6da6-4a71-a250-ba222080e21f' &&
        info.code_type !== 'raffle'
      ) {
        showModal('claimOnMainnet', {
          network: provider?.name ?? '',
          onChange: () => {
            app.providerId = '6d83b352-6da6-4a71-a250-ba222080e21f';
          },
        });
      }

      sendNotification(I18N.raffleTicketRecieved);

      referral.update({
        isUsed: true,
      });
    }
  } catch (e) {
    onTrackEvent(AdjustEvents.claimFailed, {
      claimCode: claimCode,
    });

    if (e instanceof AirdropError) {
      if (e.code === AirdropErrorCode.adressAlreadyUsed) {
        banner?.update({
          isUsed: true,
        });
      }
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
