import {
  ExplorerApiResponse,
  ExplorerReceiptStatusInfo,
  ExplorerTransaction,
  ExplorerTransactionInfo,
  ExplorerTransactionStatus,
} from '@app/types';
import {fetchWithTimeout, getHttpResponse} from '@app/utils';

const enum ExplorerModule {
  account = 'account',
  transaction = 'transaction',
}

const ExplorerAction = {
  [ExplorerModule.account]: {
    txlist: 'txlist',
  },
  [ExplorerModule.transaction]: {
    gettxinfo: 'gettxinfo',
    gettxreceiptstatus: 'gettxreceiptstatus',
    getstatus: 'getstatus',
  },
};

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
      `${this._remoteUrl}api?module=${ExplorerModule.account}&action=${ExplorerAction.account.txlist}&address=${address}`,
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
      `${this._remoteUrl}api?module=${ExplorerModule.transaction}&action=${ExplorerAction.transaction.gettxinfo}&txhash=${txHash}`,
      {
        headers: Explorer.headers,
      },
    );

    return getHttpResponse<ExplorerApiResponse<ExplorerTransactionInfo>>(
      response,
    );
  }

  /**
   * Fetch the receipt status for a given transaction hash.
   * @param txHash - The transaction hash.
   * @returns A Promise containing an ApiResponse with receipt status.
   */
  async transactionReceiptStatus(
    txHash: string,
  ): Promise<ExplorerApiResponse<ExplorerReceiptStatusInfo>> {
    const response = await fetchWithTimeout(
      `${this._remoteUrl}api?module=${ExplorerModule.transaction}&action=${ExplorerAction.transaction.gettxreceiptstatus}&txhash=${txHash}`,
      {
        headers: Explorer.headers,
      },
    );

    return getHttpResponse<ExplorerApiResponse<ExplorerReceiptStatusInfo>>(
      response,
    );
  }

  /**
   * Fetch the receipt status for a given transaction hash.
   * @param txHash - The transaction hash.
   * @returns A Promise containing an ApiResponse with receipt status.
   */
  async transactionStatus(
    txHash: string,
  ): Promise<ExplorerApiResponse<ExplorerTransactionStatus>> {
    const response = await fetchWithTimeout(
      `${this._remoteUrl}api?module=${ExplorerModule.transaction}&action=${ExplorerAction.transaction.getstatus}&txhash=${txHash}`,
      {
        headers: Explorer.headers,
      },
    );

    return getHttpResponse<ExplorerApiResponse<ExplorerTransactionStatus>>(
      response,
    );
  }
}
