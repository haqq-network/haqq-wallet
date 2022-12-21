import {runUntil} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {Transport} from '@app/services/transport';
import {TransportWallet} from '@app/types';
import {ETH_HD_PATH} from '@app/variables/common';

const compressPublicKey = (publicKey: string) => {
  let pk = Buffer.from(publicKey, 'hex');

  // eslint-disable-next-line no-bitwise
  let prefix = (pk[64] & 1) !== 0 ? 0x03 : 0x02;
  let prefixBuffer = Buffer.alloc(1);
  prefixBuffer[0] = prefix;
  return Buffer.concat([prefixBuffer, pk.slice(1, 1 + 32)]).toString('hex');
};

export class TransportLedger extends Transport implements TransportWallet {
  public stop: boolean = false;

  constructor(wallet: Wallet) {
    super(wallet);
  }

  async getPublicKey() {
    this.stop = false;
    let response = null;

    const iter = runUntil(this._wallet.deviceId!, eth => {
      return eth.getAddress(ETH_HD_PATH);
    });

    let done = false;
    do {
      const resp = await iter.next();
      response = resp.value;
      done = resp.done;
    } while (!done && !this.stop);

    await iter.abort();
    const compressedPk = compressPublicKey(response.publicKey);

    return Buffer.from(compressedPk, 'hex').toString('base64');
  }

  async signTypedData(domainHash: string, valuesHash: string) {
    this.stop = false;
    let signature = null;
    const iter = runUntil(this._wallet.deviceId!, eth =>
      eth.signEIP712HashedMessage(ETH_HD_PATH, domainHash, valuesHash),
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

    const v = (signature.v - 27).toString(16).padStart(2, '0');
    return '0x' + signature.r + signature.s + v;
  }
}
