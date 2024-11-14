import {HMAC} from 'fast-sha256';

import {CaptchaType} from '@app/components/captcha';
import {RemoteConfig} from '@app/services/remote-config';
import {getHttpResponse} from '@app/utils';

export type ClaimResponse =
  | {
      available: true;
      title: string;
      description: string;
      button_title: string;
      button_color: string;
      button_background_color: string;
      background_color_from: string;
      background_color_to: string;
      background_image_url: string;
      title_color: string | undefined;
      description_color: string | undefined;
    }
  | {
      available: false;
      unavalible_reason: string;
    };

export type CampaignCodeResponse = {
  code_type: string;
  wallet?: string;
};

export type GetDynamicLinkResponse = {
  dynamic_link: string;
  code: string;
};

export enum AirdropErrorCode {
  adressAlreadyUsed = '2094220699',
}

export class AirdropError {
  message: string;
  code: AirdropErrorCode;

  constructor(message: string, code: AirdropErrorCode) {
    this.message = message;
    this.code = code;
  }
}

export class Airdrop {
  static instance = new Airdrop();

  static headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
    connection: 'keep-alive',
    'content-type': 'application/json;charset=UTF-8',
  };

  getRemoteUrl() {
    return RemoteConfig.get('airdrop_url');
  }

  async captchaSession(): Promise<{captcha: CaptchaType; session: string}> {
    const response = await fetch(`${this.getRemoteUrl()}/mobile/session`, {
      method: 'POST',
      headers: Airdrop.headers,
    });
    return await getHttpResponse(response);
  }

  async claim(
    wallet: string,
    signature: string,
    claim_code: string,
    session: string,
    captcha: string,
    uid: string,
    adid: string | null,
  ): Promise<{}> {
    const request = await fetch(`${this.getRemoteUrl()}/mobile/claim`, {
      method: 'POST',
      headers: Airdrop.headers,
      body: JSON.stringify({
        wallet,
        signature,
        claim_code,
        session,
        captcha,
        uid,
        adid,
      }),
    });

    const resp = await getHttpResponse(request);

    if (request.status !== 200) {
      throw new AirdropError(
        resp.error,
        String(resp?.code) as AirdropErrorCode,
      );
    }

    return resp;
  }

  async info(claim_code: string): Promise<ClaimResponse> {
    const request = await fetch(`${this.getRemoteUrl()}/mobile/info`, {
      method: 'POST',
      headers: Airdrop.headers,
      body: JSON.stringify({
        claim_code,
      }),
    });

    const resp = await getHttpResponse(request);

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }

  async campaign_code(campaign_code: string): Promise<CampaignCodeResponse> {
    const request = await fetch(`${this.getRemoteUrl()}/mobile/campaign_code`, {
      method: 'POST',
      headers: Airdrop.headers,
      body: JSON.stringify({
        campaign_code,
      }),
    });

    const resp = await getHttpResponse(request);

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }

  async gasdrop_code(
    campaign_id: string | undefined,
    campaign_secret: string | undefined,
    wallet: string,
    adid: string | null,
  ): Promise<GetDynamicLinkResponse> {
    if (!campaign_id) {
      throw new Error('campaign_id is undefined');
    }

    if (!campaign_secret) {
      throw new Error('campaign_secret is undefined');
    }

    const body = JSON.stringify({
      wallet,
      adid,
    });

    const campaign_secret_buffer = new Uint8Array(
      Buffer.from(campaign_secret, 'utf-8'),
    );

    const body_buffer = new Uint8Array(Buffer.from(body, 'utf-8'));

    const h = new HMAC(campaign_secret_buffer);
    const signature = h.update(body_buffer).digest();

    const request = await fetch(
      `${this.getRemoteUrl()}/campaign/${campaign_id}/get_dynamic_link`,
      {
        method: 'POST',
        headers: {
          ...Airdrop.headers,
          signature: Buffer.from(signature).toString('hex'),
        },
        body: body,
      },
    );

    const resp = await getHttpResponse(request);

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }
}
