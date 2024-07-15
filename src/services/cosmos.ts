import {
  createMsgDelegate,
  createMsgDeposit,
  createMsgUndelegate,
  createMsgVote,
  createMsgWithdrawDelegatorReward,
} from '@evmos/eip712';
import {protoTxNamespace} from '@evmos/proto';
import {
  generateEndpointAccount,
  generateEndpointBroadcast,
  generateEndpointDistributionRewardsByAddress,
  generateEndpointGetDelegations,
  generateEndpointGetUndelegations,
  generateEndpointGetValidators,
  generateEndpointProposals,
} from '@evmos/provider';
import {AccountResponse} from '@evmos/provider/dist/rest/account';
import {BroadcastMode} from '@evmos/provider/dist/rest/broadcast';
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
  createTxMsgDeposit,
  createTxMsgMultipleWithdrawDelegatorReward,
  createTxMsgUndelegate,
  createTxMsgVote,
  createTxMsgWithdrawDelegatorReward,
  createTxRawEIP712,
  signatureToWeb3Extension,
} from '@evmos/transactions';
import {Sender} from '@evmos/transactions/dist/messages/common';
import {ProviderInterface, base64PublicKey} from '@haqq/provider-base';
import {normalize0x} from '@haqq/provider-keystone-react-native';
import Decimal from 'decimal.js';

import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {
  getRemoteBalanceValue,
  getRemoteMultiplierValue,
} from '@app/helpers/get-remote-balance-value';
import {ledgerTransportCbWrapper} from '@app/helpers/ledger-transport-wrapper';
import {Provider} from '@app/models/provider';
import {Balance} from '@app/services/balance';
import {
  DepositResponse,
  EIPTypedData,
  MarketingEvents,
  StakingParamsResponse,
} from '@app/types';
import {
  CosmosTxV1beta1GetTxResponse,
  CosmosTxV1beta1TxResponse,
  CosmosTxV1betaSimulateResponse,
  EvmosVestingV1BalancesResponse,
} from '@app/types/cosmos';
import {decimalToHex, getHttpResponse} from '@app/utils';
import {WEI} from '@app/variables/common';

import {EthSign} from './eth-sign';
import {EventTracker} from './event-tracker';

export type GetValidatorResponse = {
  validator: Validator;
};

export type BroadcastTransactionResponse = {
  tx_response: CosmosTxV1beta1TxResponse;
};

export interface ParamsResponse {
  param: {
    subspace: string;
    key: string;
    value: string;
  };
}

export class Cosmos {
  static fee: Fee = {
    amount: getRemoteBalanceValue('cosmos_min_amount').toString(),
    gas: getRemoteBalanceValue('cosmos_min_gas_limit').toString(),
    denom: 'aISLM',
  };

  public stop = false;
  private _provider: Provider;

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

    return await getHttpResponse<T>(resp);
  }

  async postQuery<T>(path: string, data: string, account?: Sender): Promise<T> {
    const params = {
      type: 'cosmos',
      network: app.provider.name,
      chainId: `${app.provider.ethChainId}`,
      address: account?.accountAddress ?? 'unknown',
    };
    try {
      EventTracker.instance.trackEvent(MarketingEvents.sendTxStart, params);
      const resp = await fetch(this.getPath(path), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: data,
      });
      EventTracker.instance.trackEvent(MarketingEvents.sendTxSuccess, params);
      return await getHttpResponse<T>(resp);
    } catch (error) {
      EventTracker.instance.trackEvent(MarketingEvents.sendTxFail, params);
      Logger.captureException(error, 'cosmos postQuery');
      throw error;
    }
  }

  async getVestingBalances(
    address: string,
  ): Promise<EvmosVestingV1BalancesResponse> {
    return this.getQuery(`/evmos/vesting/v1/balances/${address}`);
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

  async getParams(subspace: string, key: string): Promise<ParamsResponse> {
    return this.getQuery(
      `/cosmos/params/v1beta1/params?subspace=${subspace}&key=${key}`,
    );
  }

  async getStakingParams(): Promise<StakingParamsResponse> {
    return this.getQuery('/cosmos/staking/v1beta1/params');
  }

  getProposalDepositor(proposal_id: number | string, depositor: string) {
    return this.getQuery(
      `/cosmos/gov/v1beta1/proposals/${proposal_id}/deposits/${depositor}`,
    );
  }

  getProposalDeposits(proposal_id: string) {
    return this.getQuery<DepositResponse>(
      `/cosmos/gov/v1beta1/proposals/${proposal_id}/deposits`,
    );
  }

  getProposalVoter(proposal_id: string | number, voter: string) {
    return this.getQuery(
      `/cosmos/gov/v1beta1/proposals/${proposal_id}/votes/${voter}`,
    );
  }

  async postSimulate(
    message: object,
    account: Sender,
  ): Promise<CosmosTxV1betaSimulateResponse> {
    return this.postQuery(
      '/cosmos/tx/v1beta1/simulate',
      this.generatePostSimulate(message, account),
      account,
    );
  }

  async getProposalDetails(id: string | number): Promise<{proposal: Proposal}> {
    return this.getQuery(generateEndpointProposals() + `/${id}`);
  }

  async broadcastTransaction(txToBroadcast: {
    message: protoTxNamespace.txn.TxRaw;
  }): Promise<BroadcastTransactionResponse> {
    return this.postQuery(
      generateEndpointBroadcast(),
      this.generatePostBodyBroadcast(txToBroadcast),
    );
  }

  generatePostBodyBroadcast(
    txRaw: {message: protoTxNamespace.txn.TxRaw},
    broadcastMode: BroadcastMode = BroadcastMode.Sync,
  ) {
    return `{ "tx_bytes": [${txRaw.message
      .serializeBinary()
      .toString()}], "mode": "${broadcastMode}" }`;
  }

  generatePostSimulate(message: object, account: Sender) {
    const messages = Array.isArray(message) ? message : [message];

    // Logger.log('account-> pubkey', account.pubkey);

    return JSON.stringify({
      tx: {
        body: {
          messages,
          memo: '',
          timeout_height: '0',
          extension_options: [],
          non_critical_extension_options: [],
        },
        auth_info: {
          signer_infos: [
            {
              public_key: {
                '@type': '/ethermint.crypto.v1.ethsecp256k1.PubKey',
                key: account.pubkey,
              },
              mode_info: {
                single: {
                  mode: 'SIGN_MODE_DIRECT', // SIGN_MODE_LEGACY_AMINO_JSON
                },
              },
              sequence: account.sequence,
            },
          ],
          fee: {
            amount: [
              {
                denom: Cosmos.fee.denom,
                amount: Cosmos.fee.amount,
              },
            ],
            gas_limit: Cosmos.fee.gas,
            payer: '',
            granter: '',
          },
        },
        signatures: [new Buffer(0).toString('hex')],
      },
    });
  }

  async getSender(
    transport: ProviderInterface,
    hdPath: string,
  ): Promise<Sender> {
    const {address, publicKey} = await ledgerTransportCbWrapper(transport, () =>
      transport.getAccountInfo(hdPath),
    );

    const accInfo = await this.getAccountInfo(AddressUtils.toHaqq(address));
    const account: AccountResponse['account'] =
      //@ts-ignore
      accInfo?.account?.base_vesting_account || accInfo?.account;

    return {
      accountAddress: account.base_account.address,
      sequence: parseInt(account.base_account.sequence as string, 10),
      accountNumber: parseInt(account.base_account.account_number, 10),
      pubkey: base64PublicKey(publicKey),
    };
  }

  async signTypedData(
    hdPath: string,
    transport: ProviderInterface,
    domain: Record<string, any>,
    types: EIPTypedData['types'],
    message: Record<string, any>,
  ): Promise<string | undefined> {
    const signature = await transport.signTypedData(hdPath, {
      domain,
      message,
      // @ts-ignore
      types,
    });

    return normalize0x(signature);
  }

  async sendMsg(
    transport: ProviderInterface,
    hdPath: string,
    sender: Sender,
    msg: {
      legacyAmino: {
        body: protoTxNamespace.txn.TxBody;
        authInfo: protoTxNamespace.txn.AuthInfo;
      };
      eipToSign: EIPTypedData;
    },
  ) {
    const signature = await this.signTypedData(
      hdPath,
      transport,
      msg.eipToSign.domain,
      msg.eipToSign.types,
      msg.eipToSign.message,
    );

    return await this.sendSignedMsg(signature!, sender, msg);
  }

  async sendSignedMsg(
    signature: string,
    sender: Sender,
    msg: {
      legacyAmino: {
        body: protoTxNamespace.txn.TxBody;
        authInfo: protoTxNamespace.txn.AuthInfo;
      };
      eipToSign: EIPTypedData;
    },
  ) {
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

  async getFee(data: object, account: Sender) {
    let totalAmount = new Balance(parseInt(Cosmos.fee.amount, 10), 0);
    let baseGas = new Balance(parseInt(Cosmos.fee.gas, 10), 0);
    try {
      const params = await this.getParams('feemarket', 'BaseFee');
      const baseFee = new Balance(
        parseInt(params.param.value.replaceAll('"', ''), 10),
        0,
      );

      const resp = await this.postSimulate(data, account);

      // TODO Unhandled exception. Types issue.
      //@ts-ignore
      if (resp.code === 2) {
        //@ts-ignore
        throw new Error(resp.message.split('[')[0]);
      }

      if (!resp.gas_info) {
        const amount = baseFee.operate(baseGas, 'mul');
        return {
          ...Cosmos.fee,
          amount: amount.toString(),
        };
      }

      const gas = new Balance(
        decimalToHex(
          String(
            // Convert to int because decimalToHex incorrectly parse decimals work only with integers
            parseInt(
              String(
                // Multiply by cosmos_commission_multiplier
                parseInt(resp.gas_info.gas_used, 10) *
                  getRemoteMultiplierValue('cosmos_commission_multiplier'),
              ),
              10,
            ),
          ),
        ),
      ).max(baseGas);

      const amount = baseFee.operate(gas, 'mul').max(totalAmount);
      return {
        ...Cosmos.fee,
        amount: amount.toString(),
        gas: gas.toString(),
      };
    } catch (e) {
      Logger.captureException(e, 'getFee');
      return {...Cosmos.fee};
    }
  }

  async deposit(
    transport: ProviderInterface,
    hdPath: string,
    proposalId: number | string,
    amount: number,
  ) {
    const sender = await this.getSender(transport, hdPath);
    const memo = '';
    const strAmount = new Decimal(amount).mul(WEI);
    const params = {
      proposalId: parseInt(proposalId.toString(), 10),
      deposit: {
        amount: strAmount.toFixed(),
        denom: 'aISLM',
      },
    };

    const fee = await this.getFee(
      {
        '@type': '/cosmos.gov.v1beta1.MsgDeposit',
        ...createMsgDeposit(
          params.proposalId,
          sender.accountAddress,
          params.deposit,
        ).value,
      },
      sender,
    );

    const msg = createTxMsgDeposit(this.haqqChain, sender, fee, memo, params);

    return await this.sendMsg(transport, hdPath, sender, msg);
  }

  async vote(
    transport: ProviderInterface,
    hdPath: string,
    proposalId: string,
    option: number,
  ) {
    const sender = await this.getSender(transport, hdPath);

    const params = {
      proposalId: parseInt(proposalId, 10),
      option,
    };

    const fee = await this.getFee(
      {
        '@type': '/cosmos.gov.v1beta1.MsgVote',
        ...createMsgVote(
          params.proposalId,
          params.option,
          sender.accountAddress,
        ).value,
      },
      sender,
    );

    const memo = '';

    const msg = createTxMsgVote(this.haqqChain, sender, fee, memo, params);

    return await this.sendMsg(transport, hdPath, sender, msg);
  }

  async unDelegate(
    transport: ProviderInterface,
    hdPath: string,
    address: string,
    amount: number,
  ) {
    const sender = await this.getSender(transport, hdPath);

    const strAmount = new Decimal(amount).mul(WEI);

    const params = {
      validatorAddress: address,
      amount: strAmount.toFixed(),
      denom: 'aISLM',
    };

    const fee = await this.getFee(
      {
        '@type': '/cosmos.staking.v1beta1.MsgUndelegate',
        ...createMsgUndelegate(
          sender.accountAddress,
          params.validatorAddress,
          params.amount,
          params.denom,
        ).value,
      },
      sender,
    );

    const memo = '';

    const msg = createTxMsgUndelegate(
      this.haqqChain,
      sender,
      fee,
      memo,
      params,
    );

    return await this.sendMsg(transport, hdPath, sender, msg);
  }

  async simulateUndelegate(
    transport: ProviderInterface,
    hdPath: string,
    address: string,
    amount: Balance,
  ) {
    const sender = await this.getSender(transport, hdPath);

    const params = {
      validatorAddress: address,
      amount: amount.raw.toFixed(),
      denom: 'aISLM',
    };

    return this.getFee(
      {
        '@type': '/cosmos.staking.v1beta1.MsgUndelegate',
        ...createMsgUndelegate(
          sender.accountAddress,
          params.validatorAddress,
          params.amount,
          params.denom,
        ).value,
      },
      sender,
    );
  }

  async delegate(
    transport: ProviderInterface,
    hdPath: string,
    address: string,
    amount: number,
  ) {
    const sender = await this.getSender(transport, hdPath);
    const strAmount = new Decimal(amount).mul(WEI);
    const params = {
      validatorAddress: address,
      amount: strAmount.toFixed(),
      denom: 'aISLM',
    };

    const fee = await this.getFee(
      {
        '@type': '/cosmos.staking.v1beta1.MsgDelegate',
        ...createMsgDelegate(
          sender.accountAddress,
          params.validatorAddress,
          params.amount,
          params.denom,
        ).value,
      },
      sender,
    );

    const memo = '';

    const msg = createTxMsgDelegate(this.haqqChain, sender, fee, memo, params);

    return await this.sendMsg(transport, hdPath, sender, msg);
  }

  async simulateDelegate(
    transport: ProviderInterface,
    hdPath: string,
    address: string,
    amount: Balance,
  ) {
    const sender = await this.getSender(transport, hdPath);
    const params = {
      validatorAddress: address,
      amount: amount.raw.toFixed(),
      denom: 'aISLM',
    };

    return this.getFee(
      {
        '@type': '/cosmos.staking.v1beta1.MsgDelegate',
        ...createMsgDelegate(
          sender.accountAddress,
          params.validatorAddress,
          params.amount,
          params.denom,
        ).value,
      },
      sender,
    );
  }

  async multipleWithdrawDelegatorReward(
    transport: ProviderInterface,
    hdPath: string,
    validatorAddresses: string[],
  ) {
    try {
      const sender = await this.getSender(transport, hdPath);

      const params = {
        validatorAddresses,
      };

      const memo = '';

      const fee = await this.getFee(
        params.validatorAddresses.map(v => ({
          '@type': '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
          ...createMsgWithdrawDelegatorReward(sender.accountAddress, v).value,
        })),
        sender,
      );

      const msg = createTxMsgMultipleWithdrawDelegatorReward(
        this.haqqChain,
        sender,
        fee,
        memo,
        params,
      );

      const {address} = await transport.getAccountInfo(hdPath);
      const from = AddressUtils.toEth(sender.accountAddress || address);
      const signature = await EthSign.signTypedData(from, msg.eipToSign);
      await this.sendSignedMsg(signature, sender, msg);
    } catch (err) {
      Logger.captureException(err, 'multipleWithdrawDelegatorReward');
      throw err;
    }
  }

  async withdrawDelegatorReward(
    transport: ProviderInterface,
    hdPath: string,
    validatorAddress: string,
  ) {
    try {
      const sender = await this.getSender(transport, hdPath);

      const params = {
        validatorAddress,
      };

      const fee = await this.getFee(
        {
          '@type': '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
          ...createMsgWithdrawDelegatorReward(
            sender.accountAddress,
            params.validatorAddress,
          ).value,
        },
        sender,
      );

      // Logger.log('fee', fee);

      const memo = '';

      const msg = createTxMsgWithdrawDelegatorReward(
        this.haqqChain,
        sender,
        fee,
        memo,
        params,
      );

      const {address} = await ledgerTransportCbWrapper(transport, () =>
        transport.getAccountInfo(hdPath),
      );
      const from = AddressUtils.toEth(sender.accountAddress || address);
      const signature = await EthSign.signTypedData(from, msg.eipToSign);
      return await this.sendSignedMsg(signature, sender, msg);
    } catch (err) {
      Logger.captureException(err, 'withdrawDelegatorReward');
      throw err;
    }
  }
}
