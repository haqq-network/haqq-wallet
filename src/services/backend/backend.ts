import AR from '@assets/locales/ar/ar.json';
import EN from '@assets/locales/en/en.json';
import ID from '@assets/locales/id/id.json';
import TR from '@assets/locales/tr/tr.json';
import Config from 'react-native-config';

import {AppInfo} from '@app/helpers/get-app-info';
import {AppStore} from '@app/models/app';
import {Currency} from '@app/models/types';
import {
  AppLanguage,
  LanguagesResponse,
  MarkupResponse,
  NewsRow,
  NewsUpdatesResponse,
  Raffle,
  RssNewsRow,
  StoriesResponse,
} from '@app/types';
import {getHttpResponse} from '@app/utils';

import {NetworkProviderResponse} from './backend.types';

import {RemoteConfig, RemoteConfigTypes} from '../remote-config';

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
    accept: 'application/json',
    'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
    connection: 'keep-alive',
    'content-type': 'application/json;charset=UTF-8',
  };

  getRemoteUrl() {
    return Config.HAQQ_BACKEND;
  }

  async blockRequest(
    code: string,
    wallets: string[],
    uid: string,
  ): Promise<{result: boolean; error?: string}> {
    if (AppStore.isRpcOnly) {
      return {result: true};
    }
    const request = await fetch(`${this.getRemoteUrl()}block/request`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify({
        wallets,
        code,
        uid,
      }),
    });

    const resp = await getHttpResponse(request);

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }

  async contests(accounts: string[], uid: string): Promise<Raffle[]> {
    if (AppStore.isRpcOnly) {
      return [];
    }
    const request = await fetch(`${RemoteConfig.get('contests_url')}`, {
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
    if (AppStore.isRpcOnly) {
      return {} as Raffle;
    }
    const request = await fetch(
      `${RemoteConfig.get('contests_url')}/${contest}`,
      {
        method: 'POST',
        headers: Backend.headers,
        body: JSON.stringify({
          ts: Math.floor(Date.now() / 1000),
          uid,
          signature,
          session,
          address,
        }),
      },
    );

    const resp = await getHttpResponse(request);

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }

  async contestParticipateUser(
    contest: string,
    uid: string,
    session: string,
    signature: string,
    address: string,
  ): Promise<{
    signature: string;
    participant: string;
    deadline: number;
    tx_hash: string;
  }> {
    if (AppStore.isRpcOnly) {
      return {
        signature: '',
        participant: '',
        deadline: 0,
        tx_hash: '',
      };
    }
    const request = await fetch(
      `${RemoteConfig.get('contests_url')}/${contest}/participate`,
      {
        method: 'POST',
        headers: Backend.headers,
        body: JSON.stringify({
          ts: Math.floor(Date.now() / 1000),
          uid,
          signature,
          session,
          address,
        }),
      },
    );

    const resp = await getHttpResponse(request);

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }

  async contestsResult(
    contest: string,
    signature: string,
    tx_hash: string | null,
  ): Promise<{signature: string; participant: string; deadline: number}> {
    if (AppStore.isRpcOnly) {
      return {
        signature: '',
        participant: '',
        deadline: 0,
      };
    }
    const request = await fetch(
      `${RemoteConfig.get('contests_url')}/${contest}/result`,
      {
        method: 'POST',
        headers: Backend.headers,
        body: JSON.stringify({
          ts: Math.floor(Date.now() / 1000),
          tx_hash,
          signature,
        }),
      },
    );

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
    if (AppStore.isRpcOnly) {
      return {
        id: '',
        back: '',
        puzzle: '',
      };
    }
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
    if (AppStore.isRpcOnly) {
      return {
        key: '',
      };
    }
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

  async getRemoteConfig(appInfo: AppInfo): Promise<RemoteConfigTypes> {
    if (AppStore.isRpcOnly) {
      return {} as RemoteConfigTypes;
    }
    const response = await fetch(`${this.getRemoteUrl()}config`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify(appInfo),
    });

    return await getHttpResponse<RemoteConfigTypes>(response);
  }

  async news_row(item_id: string): Promise<NewsRow> {
    if (AppStore.isRpcOnly) {
      return {} as NewsRow;
    }
    const newsDetailResp = await fetch(
      `${this.getRemoteUrl()}news/${item_id}`,
      {
        headers: Backend.headers,
      },
    );
    return await getHttpResponse<NewsRow>(newsDetailResp);
  }

  async news(lastSyncNews: Date | undefined): Promise<NewsRow[]> {
    if (AppStore.isRpcOnly) {
      return [];
    }
    const sync = lastSyncNews ? `?timestamp=${lastSyncNews.toISOString()}` : '';

    const newsResp = await fetch(`${this.getRemoteUrl()}news${sync}`, {
      headers: Backend.headers,
    });
    return await getHttpResponse<NewsRow[]>(newsResp);
  }

  async rss_feed(before: Date | undefined): Promise<RssNewsRow[]> {
    if (AppStore.isRpcOnly) {
      return [];
    }
    const sync = before ? `?before=${before.toISOString()}` : '';

    const newsResp = await fetch(`${this.getRemoteUrl()}rss_feed${sync}`, {
      headers: Backend.headers,
    });
    return await getHttpResponse<RssNewsRow[]>(newsResp);
  }

  async updates(
    lastSyncUpdates: Date | undefined,
  ): Promise<NewsUpdatesResponse> {
    if (AppStore.isRpcOnly) {
      return {} as NewsUpdatesResponse;
    }
    const sync = lastSyncUpdates
      ? `?timestamp=${lastSyncUpdates.toISOString()}`
      : '';

    const newsResp = await fetch(`${this.getRemoteUrl()}updates${sync}`, {
      headers: Backend.headers,
    });
    return await getHttpResponse<NewsUpdatesResponse>(newsResp);
  }

  async updateNotificationToken(
    subscribtionId: string,
    token: string,
    uid: string,
  ): Promise<{id: string}> {
    if (AppStore.isRpcOnly) {
      return {id: ''};
    }
    const req = await fetch(
      `${this.getRemoteUrl()}notification_token/${subscribtionId}`,
      {
        method: 'POST',
        headers: Backend.headers,
        body: JSON.stringify({
          token,
          uid,
        }),
      },
    );

    return await getHttpResponse<{id: string}>(req);
  }

  async createNotificationToken(
    token: string,
    uid: string,
  ): Promise<{id: string}> {
    if (AppStore.isRpcOnly) {
      return {id: ''};
    }
    const req = await fetch(`${this.getRemoteUrl()}notification_token`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify({
        token,
        uid,
      }),
    });

    return await getHttpResponse<{id: string}>(req);
  }

  async createNotificationSubscription<T extends object>(
    token_id: string,
    address: string,
  ) {
    if (AppStore.isRpcOnly) {
      return {} as T;
    }
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
    if (AppStore.isRpcOnly) {
      return {} as T;
    }
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
    if (AppStore.isRpcOnly) {
      return {} as T;
    }
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
    if (AppStore.isRpcOnly) {
      return {} as T;
    }
    const req = await fetch(
      `${this.getRemoteUrl()}notification_subscription/${token_id}`,
      {
        method: 'DELETE',
        headers: Backend.headers,
      },
    );

    return await getHttpResponse<T>(req);
  }

  async markup(screen: string, appInfo: AppInfo): Promise<MarkupResponse> {
    if (AppStore.isRpcOnly) {
      return {} as MarkupResponse;
    }
    const response = await fetch(`${this.getRemoteUrl()}markups`, {
      method: 'POST',
      headers: Backend.headers,
      body: JSON.stringify({
        screen,
        ...appInfo,
      }),
    });
    return await getHttpResponse<MarkupResponse>(response);
  }

  async stories(): Promise<StoriesResponse> {
    if (AppStore.isRpcOnly) {
      return {} as StoriesResponse;
    }
    const response = await fetch(`${this.getRemoteUrl()}stories`, {
      method: 'GET',
      headers: Backend.headers,
    });
    return await getHttpResponse<StoriesResponse>(response);
  }

  async availableCurrencies(): Promise<Currency[]> {
    if (AppStore.isRpcOnly) {
      return [];
    }
    const response = await fetch(`${this.getRemoteUrl()}currencies`, {
      method: 'GET',
      headers: Backend.headers,
    });

    return await getHttpResponse<any>(response);
  }

  async languages(): Promise<LanguagesResponse> {
    if (AppStore.isRpcOnly) {
      return [
        {
          id: AppLanguage.en,
          title: 'English',
          created_at: '',
          updated_at: '',
          hash: '01234156789abcdef',
          local_title: 'English',
          status: 'published',
          ...EN,
        },
        {
          id: AppLanguage.ar,
          title: 'Arabic',
          created_at: '',
          updated_at: '',
          hash: '0123456789sabcdef',
          local_title: 'العربية',
          status: 'published',
          ...AR,
        },
        {
          id: AppLanguage.id,
          title: 'Indonesian',
          created_at: '',
          updated_at: '',
          hash: '01234d56789abcdef',
          local_title: 'Bahasa Indonesia',
          status: 'published',
          ...ID,
        },
        {
          id: AppLanguage.tr,
          title: 'Turkish',
          created_at: '',
          updated_at: '',
          hash: '012345678a9abcdef',
          local_title: 'Türkçe',
          status: 'published',
          ...TR,
        },
      ];
    }
    const response = await fetch(`${this.getRemoteUrl()}languages`, {
      headers: Backend.headers,
    });
    return await getHttpResponse<LanguagesResponse>(response);
  }

  async language(language: AppLanguage): Promise<Object> {
    if (AppStore.isRpcOnly) {
      return {};
    }
    const response = await fetch(
      `${this.getRemoteUrl()}languages/${language}.json`,
      {
        headers: Backend.headers,
      },
    );
    return await getHttpResponse<Object>(response);
  }

  async providers() {
    if (AppStore.isRpcOnly) {
      return [];
    }
    try {
      const response = await fetch(`${this.getRemoteUrl()}provider`, {
        headers: Backend.headers,
      });
      return await getHttpResponse<NetworkProviderResponse>(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error('Error fetching providers:', error.message);
      } else {
        Logger.error('Unknown error occurred while fetching providers');
      }
      throw error;
    }
  }
}
