import {HAQQ_BACKEND} from '@env';

import {NewsRow, NewsUpdatesResponse, Raffle} from '@app/types';
import {getHttpResponse} from '@app/utils';

import {RemoteConfigTypes} from './remote-config';

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
    const request = await fetch(`${this.getRemoteUrl()}contests`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify({
        accounts,
        uid,
      }),
    });

    const resp = await getHttpResponse(request);

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

    const resp = await getHttpResponse(request);

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }

  async captchaRequest(
    wallets: string[],
    uid: string,
    signal?: AbortController['signal'],
  ): Promise<CaptchaRequestResponse> {
    const request = await fetch(`${this.getRemoteUrl()}captcha/request`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify({
        wallets,
        uid,
      }),
      signal,
    });

    const resp = await getHttpResponse(request);

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }

  async captchaSession(
    id: string,
    code: string,
    signal?: AbortController['signal'],
  ): Promise<CaptchaSessionResponse> {
    const request = await fetch(`${this.getRemoteUrl()}captcha/session`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify({
        id,
        code,
      }),
      signal,
    });

    const resp = await getHttpResponse(request);

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }

  async getRemoteConfig(): Promise<RemoteConfigTypes> {
    const response = await fetch(`${this.getRemoteUrl()}config`, {
      method: 'GET',
      headers: Backend.headers,
    });

    return await getHttpResponse<RemoteConfigTypes>(response);
  }

  async news_row(item_id: string): Promise<NewsRow> {
    const newsDetailResp = await fetch(
      `${this.getRemoteUrl()}news/${item_id}`,
      {
        headers: Backend.headers,
      },
    );
    return await getHttpResponse<NewsRow>(newsDetailResp);
  }

  async news(lastSyncNews: Date | undefined): Promise<NewsRow[]> {
    const sync = lastSyncNews ? `?timestamp=${lastSyncNews.toISOString()}` : '';

    const newsResp = await fetch(`${this.getRemoteUrl()}news${sync}`, {
      headers: Backend.headers,
    });
    return await getHttpResponse<NewsRow[]>(newsResp);
  }

  async updates(
    lastSyncUpdates: Date | undefined,
  ): Promise<NewsUpdatesResponse> {
    const sync = lastSyncUpdates
      ? `?timestamp=${lastSyncUpdates.toISOString()}`
      : '';

    const newsResp = await fetch(`${this.getRemoteUrl()}updates${sync}`, {
      headers: Backend.headers,
    });
    return await getHttpResponse<NewsUpdatesResponse>(newsResp);
  }

  async createNotificationToken(token: string): Promise<{id: string}> {
    const req = await fetch(`${this.getRemoteUrl()}notification_token`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify({
        token,
      }),
    });

    return await getHttpResponse<{id: string}>(req);
  }

  async createNotificationSubscription<T extends object>(
    token_id: string,
    address: string,
  ) {
    const req = await fetch(`${this.getRemoteUrl()}notification_subscription`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify({
        token_id,
        address,
      }),
    });

    return await getHttpResponse<T>(req);
  }

  async removeNotificationToken<T extends object>(token_id: string) {
    const req = await fetch(
      `${this.getRemoteUrl()}notification_token/${token_id}`,
      {
        method: 'DELETE',
        headers: Backend.headers,
      },
    );

    return await getHttpResponse<T>(req);
  }

  async unsubscribeByTokenAndAddress<T extends object>(
    token_id: string,
    address: string,
  ) {
    const req = await fetch(
      `${this.getRemoteUrl()}notification_subscription/${token_id}/${address}`,
      {
        method: 'DELETE',
        headers: Backend.headers,
      },
    );

    return await getHttpResponse<T>(req);
  }

  async unsubscribeByToken<T extends object>(token_id: string) {
    const req = await fetch(
      `${this.getRemoteUrl()}notification_subscription/${token_id}`,
      {
        method: 'DELETE',
        headers: Backend.headers,
      },
    );

    return await getHttpResponse<T>(req);
  }
}
