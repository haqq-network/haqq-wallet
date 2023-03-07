import {GoogleSignin} from '@react-native-google-signin/google-signin';

import {StorageInterface} from '@app/services/provider-mpc';
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

  constructor(token: string) {
    this._token = token;
  }

  static async initialize() {
    GoogleSignin.configure({
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.appfolder',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    try {
      await GoogleSignin.signInSilently();
    } catch (e) {
      await GoogleSignin.signIn();
    }

    const tokens = await GoogleSignin.getTokens();
    return new GoogleDrive(tokens.accessToken);
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

    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=multipart`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this._token}`,
          'Content-Type': 'multipart/related; boundary=' + boundary,
        },
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
    const filesResp = await fetch(
      `${GOOGLE_API}drive/v3/files?q=name%3D'${file}'&fields=files(id%2Cname)`,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
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

    const resp = await fetch(
      `${GOOGLE_API}drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
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
      const res = await fetch(`${GOOGLE_API}drive/v3/files/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
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
}
