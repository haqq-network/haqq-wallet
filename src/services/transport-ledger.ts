import {runUntil} from '@app/helpers';
import {
  CLA,
  ERROR_CODE,
  INS,
  P1_VALUES,
  serializeHRP,
  serializePath,
} from '@app/services/ledger';
import {Transport} from '@app/services/transport';
import {TransportWallet} from '@app/types';

export class TransportLedger extends Transport implements TransportWallet {
  public stop: boolean = false;

  async getPublicKey() {
    this.stop = false;
    let response = null;
    const data = Buffer.concat([
      serializeHRP('cosmos'),
      serializePath([44, 118, 5, 0, 3]),
    ]);
    const iter = runUntil(this._wallet.deviceId!, eth => {
      return eth.transport.send(
        CLA,
        INS.GET_ADDR_SECP256K1,
        P1_VALUES.ONLY_RETRIEVE,
        0,
        data,
        [ERROR_CODE.NoError],
      );
    });

    let done = false;
    do {
      const resp = await iter.next();
      response = resp.value;
      done = resp.done;
    } while (!done && !this.stop);

    await iter.abort();

    const compressedPk = Buffer.from(response.slice(0, 33));

    return compressedPk.toString('hex');
  }

  async signTypedData(domainHash: string, valuesHash: string) {
    this.stop = false;
    let signature = null;

    const iter = runUntil(this._wallet.deviceId!, eth =>
      eth.signEIP712HashedMessage(this._wallet.path, domainHash, valuesHash),
    );

    let done = false;
    do {
      const resp = await iter.next();
      signature = resp.value;
      done = resp.done;
    } while (!done && !this.stop);

    await iter.abort();

    if (!signature) {
      throw new Error('can_not_connected');
    }

    return `${signature.v}${signature.r}${signature.s}`;
  }
}
