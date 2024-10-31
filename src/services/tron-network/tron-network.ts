import tron from 'tronweb';

import {AddressUtils} from '@app/helpers/address-utils';
import {CalculatedFees} from '@app/models/fee';
import {Provider, ProviderModel} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';

import {Balance} from '../balance';
import {TxEstimationParams} from '../eth-network/types';

type TronSignedTransaction = {
  visible: boolean;
  txID: string;
  raw_data_hex: string;
  raw_data: {
    contract: {
      parameter: {
        value: {
          to_address?: string;
          owner_address: string;
          amount?: number;
          data?: string;
          contract_address?: string;
        };
        type_url: string;
      };
      type: string;
    }[];
    ref_block_bytes: string;
    ref_block_hash: string;
    expiration: number;
    timestamp: number;
    fee_limit?: number;
  };
  signature: string[];
};

interface TronTRC20Transaction {
  visible: boolean;
  txID: string;
  raw_data: {
    contract: {
      parameter: {
        value: {
          data: string;
          owner_address: string;
          contract_address: string;
        };
        type_url: string;
      };
      type: string;
    }[];
    ref_block_bytes: string;
    ref_block_hash: string;
    expiration: number;
    fee_limit: number;
    timestamp: number;
  };
  raw_data_hex: string;
  signature: string[];
}

interface TronTRXTransaction {
  visible: boolean;
  txID: string;
  raw_data: {
    contract: {
      parameter: {
        value: {
          to_address: string;
          owner_address: string;
          amount: number;
        };
        type_url: string;
      };
      type: string;
    }[];
    ref_block_bytes: string;
    ref_block_hash: string;
    expiration: number;
    timestamp: number;
  };
  raw_data_hex: string;
  signature: string[];
}

type TronTransaction = TronTRC20Transaction | TronTRXTransaction;

const logger = Logger.create('TronNetwork', {
  emodjiPrefix: '🟤',
  stringifyJson: true,
});

export function isTRC20Transaction(
  tx: TronTransaction,
): tx is TronTRC20Transaction {
  return 'fee_limit' in tx.raw_data;
}

export function isTRXTransaction(
  tx: TronTransaction,
): tx is TronTRXTransaction {
  return !('fee_limit' in tx.raw_data);
}

// TRON CONSTANTS
const DATA_HEX_PROTOBUF_EXTRA = 2;
const MAX_RESULT_SIZE_IN_TX = 64;
const A_SIGNATURE = 67;

export class TronNetwork {
  static async broadcastTransaction(
    signedTransaction: string,
    provider: ProviderModel,
  ) {
    logger.log('[TRON] Broadcasting transaction', {
      signedTransaction,
      provider: provider.name,
    });

    const rawTxRequest = JSON.parse(
      signedTransaction.replace(/^0x/, ''),
    ) as TronSignedTransaction;

    const tronHttpProvider = new tron.providers.HttpProvider(
      provider.ethRpcEndpoint,
    );

    const tx = (await tronHttpProvider.request(
      'wallet/broadcasttransaction',
      rawTxRequest,
      'post',
    )) as {txid: string};

    logger.log('[TRON] Broadcast response', JSON.stringify(tx, null, 2));

    const contractData = rawTxRequest?.raw_data?.contract?.[0];
    const paramValue = contractData?.parameter?.value;

    // Parse transaction type and data
    const isTRC20 = contractData?.type === 'TriggerSmartContract';
    const from = paramValue?.owner_address;
    let to: string;
    let value: string;

    if (isTRC20) {
      // Handle TRC20 transfer
      to = paramValue?.contract_address ?? '';
      // Parse value from data field for TRC20
      const data = paramValue?.data ?? '';
      // Assuming standard TRC20 transfer function signature
      // Function: transfer(address _to, uint256 _value)
      if (data.startsWith('a9059cbb')) {
        const valueHex = '0x' + data.slice(74, 138);
        value = valueHex;
      } else {
        value = '0x0';
      }
    } else {
      // Handle TRX transfer
      to = paramValue?.to_address ?? '';
      value = '0x' + (paramValue?.amount ?? 0).toString(16);
    }

    // Compatibility response with ETH transaction format
    const response = {
      hash: tx.txid,
      confirmations: 0,
      from: from,
      wait: () => Promise.resolve(true),
      nonce: 0,
      to: to,
      value: value,
      gasLimit: Balance.Empty,
      maxBaseFee: Balance.Empty,
      maxPriorityFee: Balance.Empty,
      data: paramValue?.data ?? '',
      chainId: provider.ethChainId,
    };

    logger.log('[TRON] response', {response});
    return response;
  }

  static calculateBandwidthConsumption(rawDataHex: string) {
    const rawDataLengthInHex = rawDataHex.length;
    const rawDataLengthInBytes = rawDataLengthInHex / 2;
    const bandwidthConsumption =
      rawDataLengthInBytes +
      DATA_HEX_PROTOBUF_EXTRA +
      MAX_RESULT_SIZE_IN_TX +
      A_SIGNATURE;
    return bandwidthConsumption;
  }

  static calculateFeeTRX(bandwidthBytes: number) {
    const FEE_PER_BYTE = 1e-6;
    const fee = bandwidthBytes * FEE_PER_BYTE;
    return fee;
  }

  static async estimateFeeSendTRX(
    {from, to, value = Balance.Empty}: TxEstimationParams,
    provider = Provider.selectedProvider,
  ): Promise<CalculatedFees> {
    logger.log('[TRON] Estimating TRX transfer fee', {
      from,
      to,
      value: value.toString(),
    });

    const tronWeb = new tron.TronWeb({
      fullHost: provider.ethRpcEndpoint,
    });

    const transaction = await tronWeb.transactionBuilder.sendTrx(
      to.startsWith('0x') ? AddressUtils.hexToTron(to) : to,
      value.toWei(),
      Wallet.getById(from)!.tronAddress,
    );

    const rawDataHex = transaction.raw_data_hex;
    const bandwidthConsumption = this.calculateBandwidthConsumption(rawDataHex);
    const feeTRX = this.calculateFeeTRX(bandwidthConsumption);

    const fees = {
      gasLimit: Balance.Empty,
      maxBaseFee: Balance.Empty,
      maxPriorityFee: Balance.Empty,
      expectedFee: new Balance(feeTRX, 0, provider.denom),
    };

    logger.log('[TRON] Estimated fees', {fees});
    return fees;
  }

  static async estimateFeeSendTRC20(
    {from, to, value = Balance.Empty, data}: TxEstimationParams,
    provider = Provider.selectedProvider,
  ): Promise<CalculatedFees> {
    throw new Error('Not implemented');
  }
}
