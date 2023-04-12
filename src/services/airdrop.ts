export type ClaimResponse =
  | {
      available: true;
      airdrop_title: string;
      airdrop_text: string;
      airdrop_button_text: string;
      airdrop_button_text_color: string;
      airdrop_button_background_color: string;
    }
  | {
      available: false;
      unavalible_reason: string;
    };

export class Airdrop {
  private _remoteUrl: string;

  static instance = new Airdrop('https://airdrop.com');

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
