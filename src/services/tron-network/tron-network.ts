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
  signature: string[];
};

// TRON CONSTANTS
const DATA_HEX_PROTOBUF_EXTRA = 2; // Additional bytes for PROTOBUF
const MAX_RESULT_SIZE_IN_TX = 64; // Fixed overhead for transaction data
const A_SIGNATURE = 67; // Overhead for signature

export class TronNetwork {
  static async broadcastTransaction(
    signedTransaction: string,
    provider: ProviderModel,
  ) {
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
    Logger.log(
      '[TRON] wallet/broadcasttransaction',
      JSON.stringify(tx, null, 2),
    );
    // compatibility with eth
    const response = {
      hash: tx.txid,
      confirmations: 0,
      from: rawTxRequest?.raw_data?.contract?.[0]?.parameter?.value
        ?.owner_address,
      wait: () => Promise.resolve(true),
      nonce: 0,
      to: rawTxRequest?.raw_data?.contract?.[0]?.parameter?.value?.to_address,
      value:
        '0x' +
        ((rawTxRequest.raw_data?.contract?.[0]?.parameter?.value
          ?.amount).toString(16) || 0),
      gasLimit: Balance.Empty,
      maxBaseFee: Balance.Empty,
      maxPriorityFee: Balance.Empty,
      data: '',
      chainId: provider.ethChainId,
    };

    return response;
  }

  /**
   * Calculates bandwidth consumption based on the transaction's raw_data_hex.
   * @param {string} rawDataHex - Hex string of the transaction's raw_data_hex.
   * @returns {number} - Bandwidth consumption in bytes.
   * https://chaingateway.io/blog/the-ultimate-guide-to-calculate-tron-fees-plus-free-tool/
   */
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

  /**
   * Calculates the TRX fee based on bandwidth consumption.
   * @param {number} bandwidthBytes - Bandwidth consumption in bytes.
   * @returns {number} - Fee in TRX.
   */
  static calculateFeeTRX(bandwidthBytes: number) {
    const FEE_PER_BYTE = 1e-6; // 1 SUN = 0.000001 TRX
    const fee = bandwidthBytes * FEE_PER_BYTE;
    return fee;
  }

  // TODO: add support for contract interaction
  // https://chaingateway.io/blog/the-ultimate-guide-to-calculate-tron-fees-plus-free-tool/
  static async estimateFeeSendTRX(
    {from, to, value = Balance.Empty}: TxEstimationParams,
    provider = Provider.selectedProvider,
  ): Promise<CalculatedFees> {
    const tronWeb = new tron.TronWeb({
      fullHost: provider.ethRpcEndpoint,
    });

    Logger.log('from', from);

    const transaction = await tronWeb.transactionBuilder.sendTrx(
      to.startsWith('0x') ? AddressUtils.hexToTron(to) : to,
      value.toWei(),
      Wallet.getById(from)!.tronAddress,
    );

    const rawDataHex = transaction.raw_data_hex;
    const bandwidthConsumption = this.calculateBandwidthConsumption(rawDataHex);
    const feeTRX = this.calculateFeeTRX(bandwidthConsumption);

    return {
      gasLimit: Balance.Empty, // compatibility with eth
      maxBaseFee: Balance.Empty, // compatibility with eth
      maxPriorityFee: Balance.Empty, // compatibility with eth
      expectedFee: new Balance(feeTRX, 0, provider.denom),
    };
  }
}
