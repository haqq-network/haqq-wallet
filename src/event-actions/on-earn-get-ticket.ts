import {utils} from 'ethers';

import {CaptchaType} from '@app/components/captcha';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {
  awaitForPopupClosed,
  getProviderInstanceForWallet,
  showModal,
} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {getUid} from '@app/helpers/get-uid';
import {I18N, getText} from '@app/i18n';
import {VariablesBool} from '@app/models/variables-bool';
import {EthNetwork, sendNotification} from '@app/services';
import {Backend} from '@app/services/backend';
import {Balance} from '@app/services/balance';
import {PushNotificationTopicsEnum} from '@app/services/push-notifications';
import {isSendTransactionError, sleep} from '@app/utils';
import {RAFFLE_TOPIC_VARIABLE_NAME} from '@app/variables/common';

import {onNotificationsTopicSubscribe} from './on-notifications-topic-subscribe';

const abi = [
  'function participateUser(tuple(address participant, uint256 deadline) permit, bytes signature) external',
];

const logger = Logger.create('onEarnGetTicket', {stringifyJson: true});

export async function onEarnGetTicket(raffleId: string) {
  const raffleNotificationEnabled = VariablesBool.get(
    RAFFLE_TOPIC_VARIABLE_NAME,
  );

  if (!raffleNotificationEnabled) {
    onNotificationsTopicSubscribe(PushNotificationTopicsEnum.raffle);
  }

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

  const captcha = await awaitForCaptcha({variant: CaptchaType.slider});

  const uid = await getUid();
  const provider = await getProviderInstanceForWallet(leadingAccount);

  const signature = await provider.signPersonalMessage(
    leadingAccount?.path ?? '',
    `${raffleId}:${uid}:${captcha.token}`,
  );

  const response = await Backend.instance.contestParticipateUser(
    raffleId,
    uid,
    captcha.token,
    signature,
    leadingAccount?.address ?? '',
  );

  if (!response?.tx_hash) {
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
      Balance.Empty,
      data,
      new Balance(250000, 0),
    );

    const signedTx = await provider.signTransaction(
      leadingAccount.path!,
      unsignedTx,
    );

    let txHash = null;
    try {
      const {hash} = await EthNetwork.sendTransaction(signedTx);
      txHash = hash;
    } catch (err) {
      if (isSendTransactionError(err) && err.code === 'INSUFFICIENT_FUNDS') {
        logger.log('dont have fee', err);
        showModal('notEnoughGas', {
          gasLimit: new Balance(err.transaction.gasLimit.toHexString()),
          currentAmount: app.getBalance(leadingAccount.address),
        });
      } else if (isSendTransactionError(err)) {
        logger.error('error', err);
        showModal('error', {
          title: getText(I18N.modalRewardErrorTitle),
          description: err?.reason,
          close: getText(I18N.modalRewardErrorClose),
        });
      } else {
        logger.captureException(err, 'onEarnGetTicket sendTransaction', {
          raffleId,
        });
        throw err;
      }
    }

    if (txHash) {
      await sleep(6000);
      sendNotification(I18N.earnTicketRecieved);
    }

    await Backend.instance.contestsResult(raffleId, response.signature, txHash);
  } else {
    sendNotification(I18N.earnTicketAlreadyRecieved);
  }

  app.emit(Events.onRaffleTicket);
  return response;
}
