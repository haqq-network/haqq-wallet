import {
  ExplorerApiResponse,
  ExplorerTransaction,
  ExplorerTransactionInfo,
} from '@app/types';
import {fetchWithTimeout, getHttpResponse} from '@app/utils';

/**
 * The Explorer class handles blockchain-related queries
 */
export class Explorer {
  private _remoteUrl: string;
  static headers = {
    accept: 'application/json',
  };

  /**
   * Create a new Explorer instance
   * @param remoteUrl - The URL of the remote blockchain API
   */
  constructor(remoteUrl: string) {
    this._remoteUrl = remoteUrl;
  }

  /**
   * Fetch the list of transactions for a given account address
   * @param address - The 160-bit code used for identifying Accounts
   * @returns Promise of ApiResponse
   */
  async accountTxList(
    address: string,
  ): Promise<ExplorerApiResponse<ExplorerTransaction[]>> {
    const response = await fetchWithTimeout(
      `${this._remoteUrl}api?module=account&action=txlist&address=${address}`,
      {
        headers: Explorer.headers,
      },
    );

    return getHttpResponse<ExplorerApiResponse<ExplorerTransaction[]>>(
      response,
    );
  }

  /**
   * Fetch the detailed transaction information for a given transaction hash.
   * @param txHash - The transaction hash.
   * @returns A Promise containing an ApiResponse with TransactionInfo.
   */
  async transactionGetTxInfo(
    txHash: string,
  ): Promise<ExplorerApiResponse<ExplorerTransactionInfo>> {
    const response = await fetchWithTimeout(
      `${this._remoteUrl}api?module=transaction&action=gettxinfo&txhash=${txHash}`,
      {
        headers: Explorer.headers,
      },
    );

    return getHttpResponse<ExplorerApiResponse<ExplorerTransactionInfo>>(
      response,
    );
  }
}
