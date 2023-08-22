import BN from 'bn.js';
import {utils} from 'ethers';

import {CaptchaType} from '@app/components/captcha';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {
  awaitForLedger,
  awaitForPopupClosed,
  getProviderInstanceForWallet,
} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {getUid} from '@app/helpers/get-uid';
import {I18N} from '@app/i18n';
import {VariablesBool} from '@app/models/variables-bool';
import {EthNetwork, sendNotification} from '@app/services';
import {Backend} from '@app/services/backend';
import {WalletType} from '@app/types';

const abi = [
  'function participateUser(tuple(address participant, uint256 deadline) permit, bytes signature) external',
];

export async function onEarnGetTicket(raffleId: string) {
  const leadingAccount = getLeadingAccount();

  if (!leadingAccount) {
    throw new Error('No leading account');
  }

  if (!VariablesBool.get('raffleAgreement')) {
    await awaitForPopupClosed('raffleAgreement');
  }

  if (!VariablesBool.get('raffleAgreement')) {
    throw new Error('User declined raffle agreement');
  }

  const session = await awaitForCaptcha({type: CaptchaType.slider});

  const uid = await getUid();
  const provider = await getProviderInstanceForWallet(leadingAccount);

  const result = provider.signPersonalMessage(
    leadingAccount?.path ?? '',
    `${raffleId}:${uid}:${session}`,
  );
  if (leadingAccount.type === WalletType.ledgerBt) {
    await awaitForLedger(provider);
  }
  const signature = await result;

  const response = await Backend.instance.contestParticipateUser(
    raffleId,
    uid,
    session,
    signature,
    leadingAccount?.address ?? '',
  );

  const iface = new utils.Interface(abi);
  const data = iface.encodeFunctionData('participateUser', [
    {
      participant: response.participant,
      deadline: response.deadline,
    },
    Buffer.from(response.signature, 'hex'),
  ]);

  const unsignedTx = await EthNetwork.populateTransaction(
    leadingAccount.address,
    raffleId,
    new BN(0),
    data,
    250000,
  );

  const signedTx = await provider.signTransaction(
    leadingAccount.path!,
    unsignedTx,
  );

  const resp = await EthNetwork.sendTransaction(signedTx);
  const r = iface.decodeFunctionData('participateUser', resp.data);

  Logger.log('tx', JSON.stringify(r));

  sendNotification(I18N.earnTicketRecieved);
  app.emit(Events.onRaffleTicket, response);
  return response;
}
