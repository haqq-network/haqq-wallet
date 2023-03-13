import {StorageInterface} from '@haqq/provider-mpc-react-native';

import {getGoogleTokens, hasGoogleToken} from '@app/helpers/get-google-tokens';
import {makeID} from '@app/utils';

const GOOGLE_API = 'https://content.googleapis.com/';

type FilesResp = {
  files: Array<{
    id: string;
    name: string;
  }>;
};

export class GoogleDrive implements StorageInterface {
  private _token = '';

  static isEnabled() {
    return hasGoogleToken();
  }

  async getToken() {
    if (!this._token) {
      const authState = await getGoogleTokens();
      this._token = authState.accessToken;
    }

    return this._token;
  }

  getName() {
    return 'googleDrive';
  }

  async getHeaders(data: Record<string, any> = {}) {
    const token = await this.getToken();

    return {
      ...data,
      Authorization: `Bearer ${token}`,
    };
  }

  async uploadFile(id: string, filename: string, content: string) {
    let metadata = {
      name: filename,
      mimeType: 'application/json; charset=UTF-8',
    };
    let form = {
      metadata: {
        type: 'application/json; charset=UTF-8',
        value: JSON.stringify(metadata),
      },
      file: {
        type: 'application/json; charset=UTF-8',
        value: new Buffer(content).toString('base64'),
      },
    };

    const boundary = makeID(10);

    let body = this.contentDisposition(boundary, form);
    const headers = await this.getHeaders({
      'Content-Type': 'multipart/related; boundary=' + boundary,
    });
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=multipart`,
      {
        method: 'PATCH',
        headers,
        body,
      },
    );

    return await res.json();
  }

  contentDisposition(
    boundary: string,
    data: Record<string, {type: string; value: string}>,
  ) {
    let body = '';
    for (let key in data) {
      body += `--${boundary}\r\nContent-Disposition: form-data; name=${key}\r\nContent-type: ${
        data[key].type
      }${
        key === 'file' ? '\r\nContent-Transfer-Encoding: base64' : ''
      }\r\n\r\n${data[key].value}\r\n`;
    }
    body += '--' + boundary + '--\r\n';
    return body;
  }

  async getSavedFileId(file: string) {
    const headers = await this.getHeaders();
    const filesResp = await fetch(
      `${GOOGLE_API}drive/v3/files?q=name%3D'${file}'&fields=files(id%2Cname)`,
      {
        headers,
      },
    );

    const files = (await filesResp.json()) as FilesResp;

    if (!files.files.length) {
      throw new Error('share_not_found');
    }

    return files.files[0].id;
  }

  async getItem(key: string): Promise<string> {
    const fileId = await this.getSavedFileId(key);
    const headers = await this.getHeaders();
    const resp = await fetch(
      `${GOOGLE_API}drive/v3/files/${fileId}?alt=media`,
      {
        headers,
      },
    );

    return await resp.text();
  }

  async hasItem(key: string): Promise<boolean> {
    try {
      const fileId = await this.getSavedFileId(key);
      return Boolean(fileId);
    } catch (e) {
      return false;
    }
  }

  async setItem(key: string, value: string): Promise<boolean> {
    let fileId;

    try {
      fileId = await this.getSavedFileId(key);
    } catch (e) {
      const headers = await this.getHeaders();
      const res = await fetch(`${GOOGLE_API}drive/v3/files/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: key,
          mimeType: 'plain/text',
        }),
      });

      const data = await res.json();
      fileId = data.id;
    }

    const resp = await this.uploadFile(fileId, key, value);

    return resp.id === fileId;
  }

  async removeItem(key: string): Promise<boolean> {
    const fileId = await this.getSavedFileId(key);
    const headers = await this.getHeaders();
    await fetch(`${GOOGLE_API}drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers,
    });

    const exists = await this.getSavedFileId(key);

    return !exists;
  }
}
