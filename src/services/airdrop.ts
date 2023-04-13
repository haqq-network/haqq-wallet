import {AIRDROP_MAINNET_URL, AIRDROP_TESTEDGE2_URL} from '@env';

import {app} from '@app/contexts';
import {Provider} from '@app/models/provider';

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
    }
  | {
      available: false;
      unavalible_reason: string;
    };

export class Airdrop {
  static instance = new Airdrop();

  static networks = {
    54211: AIRDROP_TESTEDGE2_URL,
    11235: AIRDROP_MAINNET_URL,
  };

  getRemoteUrl() {
    const provider = Provider.getProvider(app.getUser().providerId);

    // @ts-ignore
    return Airdrop.networks[provider?.ethChainId ?? 11235] ?? '';
  }

  async claim(
    wallet: string,
    claim_code: string,
    hcaptcha_token: string,
  ): Promise<{}> {
    const request = await fetch(`${this.getRemoteUrl()}/mobile/claim`, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        connection: 'keep-alive',
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        wallet,
        claim_code,
        hcaptcha_token,
      }),
    });

    const resp = await request.json();

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }

  async info(claim_code: string): Promise<ClaimResponse> {
    const request = await fetch(`${this.getRemoteUrl()}/mobile/info`, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        connection: 'keep-alive',
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        claim_code,
      }),
    });

    const resp = await request.json();

    if (request.status !== 200) {
      throw new Error(resp.error);
    }

    return resp;
  }
}
