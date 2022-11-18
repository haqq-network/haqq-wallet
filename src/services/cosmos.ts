import {Wallet as EthersWallet} from '@ethersproject/wallet';
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
import {GetDelegationsResponse} from '@evmos/provider/dist/rest/staking';
import {
  Fee,
  createTxMsgDelegate,
  createTxRawEIP712,
  signatureToWeb3Extension,
} from '@evmos/transactions';
import converter from 'bech32-converting';
import {utils} from 'ethers';

import {app, wallets} from '@app/contexts';
import {Provider} from '@app/models/provider';
import {EthNetwork} from '@app/services/eth-network';

export class Cosmos {
  private _provider: Provider;

  static address(address: string) {
    return converter('haqq').toBech32(address);
  }

  constructor(provider: Provider) {
    this._provider = provider;
  }

  async getAccountDelegations(
    address: string,
  ): Promise<GetDelegationsResponse> {
    const delegations = await fetch(
      `${this._provider.cosmosRestEndpoint}/${generateEndpointGetDelegations(
        address,
      )}`,
    );

    return await delegations.json();
  }

  async getRewardsInfo(address: string) {
    const info = await fetch(
      `${
        this._provider.cosmosRestEndpoint
      }/${generateEndpointDistributionRewardsByAddress(address)}`,
    );

    return await info.json();
  }

  async getUnDelegations(address: string) {
    const unDelegationsResponse = await fetch(
      `${this._provider.cosmosRestEndpoint}/${generateEndpointGetUndelegations(
        address,
      )}`,
    );

    return await unDelegationsResponse.json();
  }

  async getAllValidators(limit = 1000) {
    const response = await fetch(
      `${
        this._provider.cosmosRestEndpoint
      }${generateEndpointGetValidators()}?pagination.limit=${limit}`,
      {
        method: 'get',
        headers: {'Content-Type': 'application/json'},
      },
    );
    return await response.json();
  }

  async getAccountInfo(address: string): Promise<AccountResponse> {
    const fetchedAcc = await fetch(
      `${this._provider.cosmosRestEndpoint}/${generateEndpointAccount(
        address,
      )}`,
      {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      },
    );
    return await fetchedAcc.json();
  }

  async broadcastTransaction(txToBroadcast: TxToSend) {
    try {
      const broadcastResponse = await fetch(
        `${this._provider.cosmosRestEndpoint}${generateEndpointBroadcast()}`,
        {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: generatePostBodyBroadcast(txToBroadcast),
        },
      );

      return await broadcastResponse.json();
    } catch (error) {
      console.error((error as any).message);
      throw new Error((error as any).message);
    }
  }

  async delegate(source: string, address: string, amount: number) {
    try {
      const wallet = wallets.getWallet(source);
      console.log('wallet', wallet?.address);
      const password = await app.getPassword();
      const privateKey = await wallet?.getPrivateKey(password);
      console.log('privateKey', privateKey, password);
      const ethWallet = new EthersWallet(privateKey, EthNetwork.network);

      const pubkey = Buffer.from(
        ethWallet._signingKey().compressedPublicKey.slice(2),
        'hex',
      ).toString('base64');

      // console.log(
      //   'ethWallet',
      //   ethWallet.publicKey,
      //   Buffer.from(ethWallet.publicKey).toString('base64'),
      // );
      // console.log('signature', signature);
      // try {
      //   const pubKey = signatureToPubkey(
      //     signature,
      //     Buffer.from([
      //       50, 215, 18, 245, 169, 63, 252, 16, 225, 169, 71, 95, 254, 165, 146,
      //       216, 40, 162, 115, 78, 147, 125, 80, 182, 25, 69, 136, 250, 65, 200,
      //       94, 178,
      //     ]),
      //   );
      //
      //   console.log('pubKey', pubKey);

      const senderEvmosAddress = Cosmos.address(wallet?.address!);
      const accInfo = await this.getAccountInfo(senderEvmosAddress);

      const sender = {
        accountAddress: senderEvmosAddress,
        sequence: parseInt(accInfo.account.base_account.sequence as string, 10),
        accountNumber: parseInt(
          accInfo.account.base_account.account_number,
          10,
        ),
        pubkey: pubkey,
      };

      console.log('sender', sender);

      const params = {
        validatorAddress: address,
        amount: ((amount ?? 0) * 10 ** 18).toLocaleString().replace(/,/g, ''),
        denom: 'aISLM',
      };

      console.log('params', params);

      const haqqChain = {
        chainId: this._provider.ethChainId,
        cosmosChainId: this._provider.cosmosChainId,
      };

      console.log('haqqChain', haqqChain);

      const fee: Fee = {
        amount: '5000',
        gas: '600000',
        denom: 'aISLM',
      };

      const memo = '';

      const msg = createTxMsgDelegate(haqqChain, sender, fee, memo, params);
      console.log('msg', msg);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {EIP712Domain, ...types} = msg.eipToSign.types;

      const structHash = utils._TypedDataEncoder.hash(
        msg.eipToSign.domain,
        types,
        msg.eipToSign.message,
      );

      console.log('structHash', structHash);

      const signature = await ethWallet.signMessage(structHash);

      console.log('signature', signature);
      const extension = signatureToWeb3Extension(haqqChain, sender, signature);
      console.log('extension', extension);

      const rawTx = createTxRawEIP712(
        msg.legacyAmino.body,
        msg.legacyAmino.authInfo,
        extension,
      );
      console.log('rawTx', rawTx);

      const tx = await this.broadcastTransaction(rawTx);

      console.log(tx);

      return tx;
    } catch (e) {
      console.log('err', e);
      console.log(e.stack);
    }
  }
}
