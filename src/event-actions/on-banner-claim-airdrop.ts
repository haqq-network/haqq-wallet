import {app} from '@app/contexts';
import {
  awaitForWallet,
  getProviderInstanceForWallet,
  showModal,
} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {I18N} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {Provider} from '@app/models/provider';
import {Refferal} from '@app/models/refferal';
import {Wallet} from '@app/models/wallet';
import {Airdrop} from '@app/services/airdrop';

export async function onBannerClaimAirdrop(claimCode: string) {
  const banner = Banner.getById(claimCode);

  if (!banner) {
    throw new Error('Claim not found');
  }

  const visible = Wallet.getAllVisible();

  let walletId;

  try {
    walletId = await awaitForWallet({
      wallets: visible.snapshot(),
      title: I18N.stakingDelegateAccountTitle,
    });
  } catch (e) {
    return;
  }
  const captchaKey = await awaitForCaptcha({});

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

  const referral = Refferal.getById(claimCode);

  if (referral) {
    const provider = Provider.getProvider(app.getUser().providerId);

    if (provider?.id !== '6d83b352-6da6-4a71-a250-ba222080e21f') {
      showModal('claimOnMainnet', {
        network: provider?.name ?? '',
        onChange: () => {
          app.getUser().providerId = '6d83b352-6da6-4a71-a250-ba222080e21f';
        },
      });
    }

    referral.update({
      isUsed: true,
    });
  }
}
