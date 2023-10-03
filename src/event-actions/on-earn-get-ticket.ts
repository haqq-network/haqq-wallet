import {utils} from 'ethers';

import {CaptchaType} from '@app/components/captcha';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForPopupClosed, showModal} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {getUid} from '@app/helpers/get-uid';
import {I18N, getText} from '@app/i18n';
import {VariablesBool} from '@app/models/variables-bool';
import {sendNotification} from '@app/services';
import {Backend} from '@app/services/backend';
import {Balance} from '@app/services/balance';
import {EthSign} from '@app/services/eth-sign';
import {PushNotificationTopicsEnum} from '@app/services/push-notifications';
import {isEthSignError, sleep} from '@app/utils';
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

  const signature = await EthSign.personal_sign(
    leadingAccount,
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

    try {
      const txHash = await EthSign.eth_sendTransaction(
        leadingAccount,
        {
          data,
          to: raffleId,
        },
        true,
      );

      if (txHash) {
        await sleep(6000);
        sendNotification(I18N.earnTicketRecieved);
      }

      await Backend.instance.contestsResult(
        raffleId,
        response.signature,
        txHash,
      );
    } catch (err) {
      if (isEthSignError(err)) {
        const txInfo = err.data?.details?.transaction;
        const errCode = err?.data?.details?.code;
        if (txInfo?.gasLimit && errCode === 'INSUFFICIENT_FUNDS') {
          showModal('notEnoughGas', {
            gasLimit: new Balance(txInfo.gasLimit),
            currentAmount: app.getAvailableBalance(leadingAccount.address),
          });
        } else {
          showModal('error', {
            title: getText(I18N.modalRewardErrorTitle),
            description: err.message,
            close: getText(I18N.modalRewardErrorClose),
          });
        }
      }

      logger.captureException(err, 'onEarnGetTicket sendTransaction', {
        raffleId,
      });

      await Backend.instance.contestsResult(raffleId, response.signature, null);
      throw err;
    }
  } else {
    sendNotification(I18N.earnTicketAlreadyRecieved);
  }

  app.emit(Events.onRaffleTicket);
  return response;
}
