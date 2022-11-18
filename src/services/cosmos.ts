import {TypedDataField} from '@ethersproject/abstract-signer';
import {hexConcat, joinSignature} from '@ethersproject/bytes';
import {keccak256} from '@ethersproject/keccak256';
import {Wallet as EthersWallet} from '@ethersproject/wallet';
import {protoTxNamespace} from '@evmos/proto';
import {
  generateEndpointAccount,
  generateEndpointBroadcast,
  generateEndpointDistributionRewardsByAddress,
  generateEndpointGetDelegations,
  generateEndpointGetUndelegations,
  generateEndpointGetValidators,
  generatePostBodyBroadcast,
} from '@evmos/provider';
import {AccountResponse} from '@evmos/provider/dist/rest/account';
import {TxToSend} from '@evmos/provider/dist/rest/broadcast';
import {
  DistributionRewardsResponse,
  GetDelegationsResponse,
  UndelegationResponse,
} from '@evmos/provider/dist/rest/staking';
import {
  Chain,
  Fee,
  createTxMsgDelegate,
  createTxMsgUndelegate,
  createTxRawEIP712,
  signatureToWeb3Extension,
} from '@evmos/transactions';
import {Sender} from '@evmos/transactions/dist/messages/common';
import converter from 'bech32-converting';
import {utils} from 'ethers';

import {app, wallets} from '@app/contexts';
import {Provider} from '@app/models/provider';
import {EthNetwork} from '@app/services/eth-network';
import {GWEI} from '@app/variables';

export class Cosmos {
  private _provider: Provider;

  static fee: Fee = {
    amount: '5000',
    gas: '600000',
    denom: 'aISLM',
  };

  static address(address: string) {
    return converter('haqq').toBech32(address);
  }

  constructor(provider: Provider) {
    this._provider = provider;
  }

  get haqqChain(): Chain {
    return {
      chainId: this._provider.ethChainId,
      cosmosChainId: this._provider.cosmosChainId,
    };
  }

  getPath(subPath: string) {
    if (subPath.startsWith('/')) {
      return `${this._provider.cosmosRestEndpoint}${subPath}`;
    }

    return `${this._provider.cosmosRestEndpoint}/${subPath}`;
  }

  async getQuery<T>(path: string): Promise<T> {
    const resp = await fetch(this.getPath(path), {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    });

    return await resp.json();
  }

  async postQuery<T>(path: string, data: string): Promise<T> {
    const resp = await fetch(this.getPath(path), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: data,
    });

    return await resp.json();
  }

  async getAccountDelegations(
    address: string,
  ): Promise<GetDelegationsResponse> {
    return this.getQuery(generateEndpointGetDelegations(address));
  }

  async getRewardsInfo(address: string): Promise<DistributionRewardsResponse> {
    return this.getQuery(generateEndpointDistributionRewardsByAddress(address));
  }

  async getUnDelegations(address: string): Promise<UndelegationResponse> {
    return this.getQuery(generateEndpointGetUndelegations(address));
  }

  async getAllValidators(limit = 1000) {
    return this.getQuery(
      generateEndpointGetValidators() + `?pagination.limit=${limit}`,
    );
  }

  async getAccountInfo(address: string): Promise<AccountResponse> {
    return this.getQuery(generateEndpointAccount(address));
  }

  async broadcastTransaction(txToBroadcast: TxToSend) {
    try {
      return this.postQuery(
        generateEndpointBroadcast(),
        generatePostBodyBroadcast(txToBroadcast),
      );
    } catch (error) {
      console.error((error as any).message);
      throw new Error((error as any).message);
    }
  }

  async getSender(ethAddress: string) {
    const wallet = wallets.getWallet(ethAddress);
    const password = await app.getPassword();
    const privateKey = await wallet?.getPrivateKey(password);

    const ethWallet = new EthersWallet(privateKey, EthNetwork.network);

    const pubkey = Buffer.from(
      ethWallet._signingKey().compressedPublicKey.slice(2),
      'hex',
    ).toString('base64');

    const senderEvmosAddress = Cosmos.address(wallet?.address!);
    const accInfo = await this.getAccountInfo(senderEvmosAddress);

    return {
      accountAddress: senderEvmosAddress,
      sequence: parseInt(accInfo.account.base_account.sequence as string, 10),
      accountNumber: parseInt(accInfo.account.base_account.account_number, 10),
      pubkey: pubkey,
    };
  }

  async signRequest(
    ethAddress: string,
    domain: Record<string, any>,
    types: Record<string, Array<TypedDataField>>,
    message: Record<string, any>,
  ) {
    const wallet = wallets.getWallet(ethAddress);
    const password = await app.getPassword();
    const privateKey = await wallet?.getPrivateKey(password);

    const ethWallet = new EthersWallet(privateKey, EthNetwork.network);

    // @ts-ignore
    const {EIP712Domain, ...othTypes} = types;

    const domainHash = utils._TypedDataEncoder.hashStruct(
      'EIP712Domain',
      {EIP712Domain},
      domain,
    );
    const valuesHash = utils._TypedDataEncoder.from(othTypes).hash(message);

    const concatHash = hexConcat(['0x1901', domainHash, valuesHash]);

    const hash = keccak256(concatHash);

    return joinSignature(ethWallet._signingKey().signDigest(hash));
  }

  async sendMsg(
    source: string,
    sender: Sender,
    msg: {
      eipToSign: {
        domain: Record<string, any>;
        types: Record<string, Array<TypedDataField>>;
        message: Record<string, any>;
      };
      legacyAmino: {
        body: protoTxNamespace.txn.TxBody;
        authInfo: protoTxNamespace.txn.AuthInfo;
      };
    },
  ) {
    const signature = await this.signRequest(
      source,
      msg.eipToSign.domain,
      msg.eipToSign.types,
      msg.eipToSign.message,
    );

    const extension = signatureToWeb3Extension(
      this.haqqChain,
      sender,
      signature,
    );

    const rawTx = createTxRawEIP712(
      msg.legacyAmino.body,
      msg.legacyAmino.authInfo,
      extension,
    );

    return await this.broadcastTransaction(rawTx);
  }

  async unDelegate(source: string, address: string, amount: number) {
    try {
      const sender = await this.getSender(source);

      const params = {
        validatorAddress: address,
        amount: ((amount ?? 0) * GWEI).toLocaleString().replace(/,/g, ''),
        denom: 'aISLM',
      };

      const memo = '';

      const msg = createTxMsgUndelegate(
        this.haqqChain,
        sender,
        Cosmos.fee,
        memo,
        params,
      );

      return await this.sendMsg(source, sender, msg);
    } catch (e) {
      console.log('err', e);
    }
  }

  async delegate(source: string, address: string, amount: number) {
    try {
      const sender = await this.getSender(source);

      const params = {
        validatorAddress: address,
        amount: ((amount ?? 0) * GWEI).toLocaleString().replace(/,/g, ''),
        denom: 'aISLM',
      };

      const memo = '';

      const msg = createTxMsgDelegate(
        this.haqqChain,
        sender,
        Cosmos.fee,
        memo,
        params,
      );

      return await this.sendMsg(source, sender, msg);
    } catch (e) {
      console.log('err', e);
    }
  }
}
