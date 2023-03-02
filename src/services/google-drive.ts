import {makeID} from '@app/utils';

export class GoogleDrive {
  private _token = '';

  constructor(token: string) {
    this._token = token;
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

    const data = await res.text();

    return data;
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
}
