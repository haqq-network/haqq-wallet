import tron from 'tronweb';

import {AddressUtils} from '@app/helpers/address-utils';
import {CalculatedFees} from '@app/models/fee';
import {Provider, ProviderModel} from '@app/models/provider';

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

const logger = Logger.create('TronNetwork', {});

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
const SUN_PER_TRX = 1_000_000;
const BANDWIDTH_PRICE_IN_SUN = 1000; // 1000 SUN per byte

export class TronNetwork {
  static TOKEN_TRANSFER_SELECTOR = 'a9059cbb';
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
      if (data.startsWith(TronNetwork.TOKEN_TRANSFER_SELECTOR)) {
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

    logger.log(
      'broadcastTransaction response:',
      JSON.stringify(response, null, 2),
    );
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

  static async getAccountBandwidth(
    address: string,
    provider = Provider.selectedProvider,
  ) {
    const tronWeb = new tron.TronWeb({
      fullHost: provider.ethRpcEndpoint,
    });

    try {
      const resources = await tronWeb.trx.getAccountResources(address);

      return {
        freeNetUsed: resources.freeNetUsed || 0,
        freeNetLimit: resources.freeNetLimit || 0,
        netUsed: resources.NetUsed || 0,
        netLimit: resources.NetLimit || 0,
      };
    } catch (error) {
      logger.error('getAccountBandwidth', error);
      return {
        freeNetUsed: 0,
        freeNetLimit: 0,
        netUsed: 0,
        netLimit: 0,
      };
    }
  }

  static calculateFeeTRX(bandwidthBytes: number) {
    // Each byte costs 1000 SUN
    const feeInSun = bandwidthBytes * BANDWIDTH_PRICE_IN_SUN;
    // Convert SUN to TRX (1 TRX = 1,000,000 SUN)
    const feeTRX = feeInSun / SUN_PER_TRX;
    return feeTRX;
  }

  static async estimateFeeSendTRX(
    {from, to, value = Balance.Empty}: TxEstimationParams,
    provider = Provider.selectedProvider,
  ): Promise<CalculatedFees> {
    const tronWeb = new tron.TronWeb({
      fullHost: provider.ethRpcEndpoint,
    });

    try {
      const transaction = await tronWeb.transactionBuilder.sendTrx(
        AddressUtils.toTron(to),
        value.toParsedBalanceNumber(),
        AddressUtils.toTron(from),
      );

      const rawDataHex = transaction.raw_data_hex;
      const bandwidthConsumption =
        this.calculateBandwidthConsumption(rawDataHex);
      const feeTRX = this.calculateFeeTRX(bandwidthConsumption);

      const fees = {
        gasLimit: Balance.Empty,
        maxBaseFee: Balance.Empty,
        maxPriorityFee: Balance.Empty,
        expectedFee: new Balance(feeTRX, 0, provider.denom),
      };

      return fees;
    } catch (error) {
      logger.error('estimateFeeSendTRX error:', error);

      // Fallback fee calculation using standard TRX transfer size
      const STANDARD_TRX_TRANSFER_SIZE = 285; // Standard size for TRX transfer in bytes
      const fallbackBandwidthConsumption = this.calculateBandwidthConsumption(
        '0'.repeat(STANDARD_TRX_TRANSFER_SIZE * 2), // Convert bytes to hex string length
      );
      const fallbackFeeTRX = this.calculateFeeTRX(fallbackBandwidthConsumption);

      // Return fallback fee estimation
      return {
        gasLimit: Balance.Empty,
        maxBaseFee: Balance.Empty,
        maxPriorityFee: Balance.Empty,
        expectedFee: new Balance(fallbackFeeTRX, 0, provider.denom),
      };
    }
  }

  static async estimateFeeSendTRC20(
    {from, to, value = Balance.Empty, data}: TxEstimationParams,
    provider = Provider.selectedProvider,
  ): Promise<CalculatedFees> {
    const tronWeb = new tron.TronWeb({
      fullHost: provider.ethRpcEndpoint,
    });
    // Convert addresses to TRON format
    const contractAddress = AddressUtils.hexToTron(data);
    const fromAddress = AddressUtils.toTron(from);
    const toAddress = AddressUtils.toTron(to);

    const functionSelector = 'transfer(address,uint256)';
    const parameter = [
      {type: 'address', value: toAddress},
      {
        type: 'uint256',
        value: value.toParsedBalanceNumber(),
      },
    ];

    try {
      const energyEstimate = await tronWeb.transactionBuilder.estimateEnergy(
        contractAddress,
        functionSelector,
        {},
        parameter,
        fromAddress,
      );

      if (!energyEstimate?.energy_required) {
        throw new Error('Failed to estimate energy');
      }

      // Calculate fee based on energy required
      // 1 energy = 420 SUN
      const ENERGY_FEE_RATE = 420;
      const energyFee = energyEstimate.energy_required * ENERGY_FEE_RATE;

      // Get transaction structure for bandwidth estimation
      const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
        contractAddress,
        functionSelector,
        {
          feeLimit: energyFee,
          callValue: 0,
        },
        parameter,
        fromAddress,
      );

      // Calculate bandwidth fee
      const bandwidthConsumption = this.calculateBandwidthConsumption(
        transaction?.transaction?.raw_data_hex ?? '',
      );
      const bandwidthFee = this.calculateFeeTRX(bandwidthConsumption);

      // Total fee is energy fee + bandwidth fee
      const totalFee = energyFee * 1e-6 + bandwidthFee;

      const fees = {
        gasLimit: Balance.Empty,
        maxBaseFee: Balance.Empty,
        maxPriorityFee: Balance.Empty,
        expectedFee: new Balance(totalFee, 0, provider.denom),
      };

      return fees;
    } catch (error) {
      logger.error('estimateFeeSendTRC20', error);

      // Fallback to basic estimation if energy estimation fails
      const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
        contractAddress,
        functionSelector,
        {
          feeLimit: 1_000_000, // Default fee limit
          callValue: 0,
        },
        parameter,
        fromAddress,
      );

      const bandwidthConsumption = this.calculateBandwidthConsumption(
        transaction?.transaction?.raw_data_hex ?? '',
      );
      const feeTRX = this.calculateFeeTRX(bandwidthConsumption);

      const fees = {
        gasLimit: Balance.Empty,
        maxBaseFee: Balance.Empty,
        maxPriorityFee: Balance.Empty,
        expectedFee: new Balance(feeTRX, 0, provider.denom),
      };

      return fees;
    }
  }
}
