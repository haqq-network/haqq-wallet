import {awaitForWallet} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {I18N} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {Wallet} from '@app/models/wallet';
import {Airdrop} from '@app/services/airdrop';

export async function onBannerClaimAirdrop(claimCode: string) {
  const banner = Banner.getById(claimCode);

  if (!banner) {
    throw new Error('Claim not found');
  }

  const visible = Wallet.getAllVisible();

  const wallet = await awaitForWallet({
    wallets: visible.snapshot(),
    title: I18N.stakingDelegateAccountTitle,
  });

  const captchaKey = await awaitForCaptcha();

  await Airdrop.instance.claim(wallet, claimCode, captchaKey);

  banner.update({
    isUsed: true,
  });
}
