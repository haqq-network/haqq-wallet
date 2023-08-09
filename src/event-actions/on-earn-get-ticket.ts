import {utils} from 'ethers';

import {CaptchaType} from '@app/components/captcha';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForPopupClosed, getProviderInstanceForWallet} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {getUid} from '@app/helpers/get-uid';
import {I18N} from '@app/i18n';
import {VariablesBool} from '@app/models/variables-bool';
import {sendNotification} from '@app/services';
import {Backend} from '@app/services/backend';

export async function onEarnGetTicket(raffleId: string) {
  const leadingAccount = getLeadingAccount();

  if (!leadingAccount) {
    throw new Error('No leading account');
  }

  if (!VariablesBool.get('raffleAgreement')) {
    await awaitForPopupClosed('raffleAgreement');
    VariablesBool.set('raffleAgreement', true);
  }

  if (!VariablesBool.get('raffleAgreement')) {
    throw new Error('User declined raffle agreement');
  }

  const session = await awaitForCaptcha({type: CaptchaType.slider});

  const uid = await getUid();
  const provider = await getProviderInstanceForWallet(leadingAccount);

  const signature = await provider.signPersonalMessage(
    leadingAccount?.path ?? '',
    `${raffleId}:${uid}:${session}`,
  );

  const response = await Backend.instance.contestParticipateUser(
    raffleId,
    uid,
    session,
    signature,
    leadingAccount?.address ?? '',
  );

  const domainHash = utils._TypedDataEncoder.hashStruct(
    'EIP712Domain',
    {
      ContestV2: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'string',
        },
      ],
    },
    {
      name: 'ContestV2',
      version: '1',
      chainId: '11235',
      verifyingContract: raffleId,
    },
  );
  const valuesHash = utils._TypedDataEncoder
    .from({
      ParticipationPermit: [
        {name: 'participant', type: 'address'},
        {name: 'deadline', type: 'uint256'},
      ],
    })
    .hash({
      participant: response.participant,
      deadline: response.deadline,
    });

  const usersSignature = await provider.signTypedData(
    leadingAccount.path!,
    domainHash,
    valuesHash,
  );

  Logger.log('usersSignature', usersSignature);

  sendNotification(I18N.earnTicketRecieved);
  app.emit(Events.onRaffleTicket, response);
  return response;
}
