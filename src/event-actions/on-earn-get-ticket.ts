import {CaptchaType} from '@app/components/captcha';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {getProviderInstanceForWallet} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {getUid} from '@app/helpers/get-uid';
import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {Backend} from '@app/services/backend';

export async function onEarnGetTicket(raffleId: string) {
  const leadingAccount = getLeadingAccount();

  if (!leadingAccount) {
    throw new Error('No leading account');
  }

  const session = await awaitForCaptcha({type: CaptchaType.slider});

  const uid = await getUid();
  const provider = await getProviderInstanceForWallet(leadingAccount);

  const signature = await provider.signPersonalMessage(
    leadingAccount?.path ?? '',
    `${raffleId}:${uid}:${session}`,
  );

  const response = await Backend.instance.contestParticipate(
    raffleId,
    uid,
    session,
    signature,
    leadingAccount?.address ?? '',
  );
  sendNotification(I18N.earnTicketRecieved);
  app.emit(Events.onRaffleTicket, response);
  return response;
}
