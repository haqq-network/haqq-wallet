import {TypedDataField} from '@ethersproject/abstract-signer';
import {protoTxNamespace} from '@evmos/proto';
import {
  generateEndpointAccount,
  generateEndpointBroadcast,
  generateEndpointDistributionRewardsByAddress,
  generateEndpointGetDelegations,
  generateEndpointGetUndelegations,
  generateEndpointGetValidators,
  generateEndpointProposals,
  generatePostBodyBroadcast,
} from '@evmos/provider';
import {AccountResponse} from '@evmos/provider/dist/rest/account';
import {TxToSend} from '@evmos/provider/dist/rest/broadcast';
import {Proposal, ProposalsResponse} from '@evmos/provider/dist/rest/gov';
import {
  DistributionRewardsResponse,
  GetDelegationsResponse,
  GetUndelegationsResponse,
  GetValidatorsResponse,
  Validator,
} from '@evmos/provider/dist/rest/staking';
import {
  Chain,
  Fee,
  createTxMsgDelegate,
  createTxMsgMultipleWithdrawDelegatorReward,
  createTxMsgUndelegate,
  createTxMsgVote,
  createTxMsgWithdrawDelegatorReward,
  createTxRawEIP712,
  signatureToWeb3Extension,
} from '@evmos/transactions';
import {Sender} from '@evmos/transactions/dist/messages/common';
import converter from 'bech32-converting';
import {utils} from 'ethers';

import {wallets} from '@app/contexts';
import {captureException} from '@app/helpers';
import {Provider} from '@app/models/provider';
import {StakingMetadata} from '@app/models/staking-metadata';
import {
  CosmosTxV1beta1GetTxResponse,
  CosmosTxV1beta1TxResponse,
} from '@app/types/cosmos';
import {WEI} from '@app/variables';

export type GetValidatorResponse = {
  validator: Validator;
};

export type BroadcastTransactionResponse = {
  tx_response: CosmosTxV1beta1TxResponse;
};

export class Cosmos {
  private _provider: Provider;
  public stop = false;
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

  async getAccountRewardsInfo(
    address: string,
  ): Promise<DistributionRewardsResponse> {
    return this.getQuery(generateEndpointDistributionRewardsByAddress(address));
  }

  async getAccountUnDelegations(
    address: string,
  ): Promise<GetUndelegationsResponse> {
    return this.getQuery(generateEndpointGetUndelegations(address));
  }

  async getAllValidators(limit = 1000): Promise<GetValidatorsResponse> {
    return this.getQuery(
      generateEndpointGetValidators() + `?pagination.limit=${limit}`,
    );
  }

  async getValidator(address: string): Promise<GetValidatorResponse> {
    return this.getQuery(`/cosmos/staking/v1beta1/validators/${address}`);
  }

  async getAccountInfo(address: string): Promise<AccountResponse> {
    return this.getQuery(generateEndpointAccount(address));
  }

  async getTransaction(hash: string): Promise<CosmosTxV1beta1GetTxResponse> {
    return this.getQuery(`/cosmos/tx/v1beta1/txs/${hash}`);
  }

  async getProposals(): Promise<ProposalsResponse> {
    return this.getQuery(
      generateEndpointProposals() + '?pagination.reverse=true',
    );
  }

  async getProposalDetails(id: string): Promise<{proposal: Proposal}> {
    return this.getQuery(generateEndpointProposals() + `/${id}`);
  }

  async broadcastTransaction(
    txToBroadcast: TxToSend,
  ): Promise<BroadcastTransactionResponse> {
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

    if (!wallet) {
      throw new Error('wallet_not_found');
    }

    const accInfo = await this.getAccountInfo(wallet.cosmosAddress);
    const pubkey = await wallet.transport?.getPublicKey();
    return {
      accountAddress: accInfo.account.base_account.address,
      sequence: parseInt(accInfo.account.base_account.sequence as string, 10),
      accountNumber: parseInt(accInfo.account.base_account.account_number, 10),
      pubkey,
    };
  }

  async signTypedData(
    ethAddress: string,
    domain: Record<string, any>,
    types: Record<string, Array<TypedDataField>>,
    message: Record<string, any>,
  ): Promise<string | undefined> {
    const wallet = wallets.getWallet(ethAddress);

    // @ts-ignore
    const {EIP712Domain, ...othTypes} = types;

    const domainHash = utils._TypedDataEncoder.hashStruct(
      'EIP712Domain',
      {EIP712Domain},
      domain,
    );
    const valuesHash = utils._TypedDataEncoder.from(othTypes).hash(message);

    return await wallet?.transport.signTypedData(domainHash, valuesHash);
  }

  async sendMsg(
    source: string,
    sender: Sender,
    msg: {
      legacyAmino: {
        body: protoTxNamespace.txn.TxBody;
        authInfo: protoTxNamespace.txn.AuthInfo;
      };
      eipToSign: {
        types: object;
        primaryType: string;
        domain: {
          name: string;
          version: string;
          chainId: number;
          verifyingContract: string;
          salt: string;
        };
        message: object;
      };
    },
  ) {
    const signature = await this.signTypedData(
      source,
      msg.eipToSign.domain,
      msg.eipToSign.types as Record<string, Array<TypedDataField>>,
      msg.eipToSign.message,
    );

    const extension = signatureToWeb3Extension(
      this.haqqChain,
      sender,
      signature!,
    );

    const rawTx = createTxRawEIP712(
      msg.legacyAmino.body,
      msg.legacyAmino.authInfo,
      extension,
    );

    return await this.broadcastTransaction(rawTx);
  }

  async vote(source: string, proposalId: number, option: number) {
    try {
      const sender = await this.getSender(source);

      const params = {
        proposalId,
        option,
      };

      const memo = '';

      const msg = createTxMsgVote(
        this.haqqChain,
        sender,
        Cosmos.fee,
        memo,
        params,
      );

      return await this.sendMsg(source, sender, msg);
    } catch (e) {
      captureException(e, 'Cosmos.delegate');
    }
  }

  async unDelegate(source: string, address: string, amount: number) {
    try {
      const sender = await this.getSender(source);

      const params = {
        validatorAddress: address,
        amount: ((amount ?? 0) * WEI).toString(),
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
        amount: ((amount ?? 0) * WEI).toString(),
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
      captureException(e, 'Cosmos.delegate');
    }
  }

  async multipleWithdrawDelegatorReward(
    source: string,
    validatorAddresses: string[],
  ) {
    try {
      const sender = await this.getSender(source);

      const params = {
        validatorAddresses,
      };

      const memo = '';

      const msg = createTxMsgMultipleWithdrawDelegatorReward(
        this.haqqChain,
        sender,
        Cosmos.fee,
        memo,
        params,
      );

      return await this.sendMsg(source, sender, msg);
    } catch (e) {
      captureException(e, 'Cosmos.multipleWithdrawDelegatorReward');
    }
  }

  async withdrawDelegatorReward(source: string, validatorAddress: string) {
    try {
      const sender = await this.getSender(source);

      const params = {
        validatorAddress,
      };

      const memo = '';

      const msg = createTxMsgWithdrawDelegatorReward(
        this.haqqChain,
        sender,
        Cosmos.fee,
        memo,
        params,
      );

      return await this.sendMsg(source, sender, msg);
    } catch (e) {
      captureException(e, 'Cosmos.withdrawDelegatorReward');
    }
  }

  sync(addressList: string[]) {
    const rows = StakingMetadata.getAll().snapshot();

    return Promise.all(
      addressList.reduce<Promise<string[]>[]>((memo, curr) => {
        return memo.concat([
          this.syncStakingDelegations(curr),
          this.syncStakingUnDelegations(curr),
          this.syncStakingRewards(curr),
        ]);
      }, []),
    ).then(results => {
      const hashes = new Set(results.flat());
      for (const e of rows) {
        if (!hashes.has(e.hash)) {
          StakingMetadata.remove(e.hash);
        }
      }
    });
  }

  async syncStakingDelegations(address: string): Promise<string[]> {
    return this.getAccountDelegations(address)
      .then(resp =>
        resp.delegation_responses.map(d =>
          StakingMetadata.createDelegation(
            d.delegation.delegator_address,
            d.delegation.validator_address,
            d.balance.amount,
          ),
        ),
      )
      .then(hashes => hashes.filter(Boolean) as string[]);
  }

  async syncStakingUnDelegations(address: string): Promise<string[]> {
    return this.getAccountUnDelegations(address)
      .then(resp => {
        return resp.unbonding_responses
          .map(ur => {
            return ur.entries.map(ure =>
              StakingMetadata.createUnDelegation(
                ur.delegator_address,
                ur.validator_address,
                ure.balance,
                ure.completion_time,
              ),
            );
          })
          .flat();
      })
      .then(hashes => hashes.filter(Boolean) as string[]);
  }

  async syncStakingRewards(address: string): Promise<string[]> {
    return this.getAccountRewardsInfo(address)
      .then(resp => {
        return resp.rewards
          .map(r =>
            r.reward.map(rr =>
              StakingMetadata.createReward(
                address,
                r.validator_address,
                rr.amount,
              ),
            ),
          )
          .flat();
      })
      .then(hashes => hashes.filter(Boolean) as string[]);
  }
}
