import {HAQQ_BACKEND} from '@env';

import {getUid} from '@app/helpers/get-uid';
import {Wallet} from '@app/models/wallet';

export async function awaitForSession() {
  const req_for_captcha = await fetch(`${HAQQ_BACKEND}captcha/request`, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
      connection: 'keep-alive',
      'content-type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify({
      wallets: Wallet.getAll().map(wallet => wallet.address),
      uid: getUid(),
    }),
  });
  const resp_for_captcha = await req_for_captcha.json();

  const req_for_session = await fetch(`${HAQQ_BACKEND}captcha/session`, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
      connection: 'keep-alive',
      'content-type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify({
      id: resp_for_captcha.id,
      code: resp_for_captcha.code,
    }),
  });

  const session = await req_for_session.json();
  console.log('session session', session);
  return session.key;
}
