export type ClaimResponse =
  | {
      available: true;
      title: string;
      text: string;
      button_text: string;
      button_text_color: string;
      button_background_color: string;
      background_color_from: string;
      background_color_to: string;
    }
  | {
      available: false;
      unavalible_reason: string;
    };

export class Airdrop {
  static instance = new Airdrop('https://mimir.cipher.land');
  private _remoteUrl: string;

  constructor(remoteUrl: string) {
    this._remoteUrl = remoteUrl;
  }

  async claim(
    wallet: string,
    claim_code: string,
    hcaptcha_token: string,
  ): Promise<{}> {
    const request = await fetch(`${this._remoteUrl}/mobile/claim`, {
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
    const request = await fetch(`${this._remoteUrl}/mobile/info`, {
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
