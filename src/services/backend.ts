import {HAQQ_BACKEND} from '@env';

import {Raffle} from '@app/types';

export type CaptchaRequestResponse = {
  id: string;
  back: string;
  puzzle: string;
};

export type CaptchaSessionResponse = {
  key: string;
};

export class Backend {
  static instance = new Backend();

  static headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
    connection: 'keep-alive',
    'content-type': 'application/json;charset=UTF-8',
  };

  getRemoteUrl() {
    return HAQQ_BACKEND;
  }

  async contests(accounts: string[], uid: string): Promise<Raffle[]> {
    console.log('contests', this.getRemoteUrl(), accounts, uid);
    const request = await fetch(`${this.getRemoteUrl()}contests`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify({
        accounts,
        uid,
      }),
    });

    const resp = await request.json();

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }

  async contestParticipate(
    contest: string,
    uid: string,
    session: string,
    signature: string,
    address: string,
  ): Promise<Raffle> {
    const request = await fetch(`${this.getRemoteUrl()}contests/${contest}`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify({
        ts: Math.floor(Date.now() / 1000),
        uid,
        signature,
        session,
        address,
      }),
    });

    const resp = await request.json();

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }

  async captchaRequest(
    wallets: string[],
    uid: string,
  ): Promise<CaptchaRequestResponse> {
    const request = await fetch(`${this.getRemoteUrl()}captcha/request`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify({
        wallets,
        uid,
      }),
    });

    const resp = await request.json();

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }

  async captchaSession(
    id: string,
    code: string,
  ): Promise<CaptchaSessionResponse> {
    const request = await fetch(`${HAQQ_BACKEND}captcha/session`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify({
        id,
        code,
      }),
    });

    const resp = await request.json();

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }
}
