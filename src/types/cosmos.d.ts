export interface CosmosTxV1beta1Tx {
  body?: BodyIsTheProcessableContentOfTheTransaction;
  auth_info?: CosmosTxV1beta1AuthInfo;
  /**
   * signatures is a list of signatures that matches the length and order of AuthInfo's signer_infos to allow connecting signature meta information like public key and signing mode by position.
   */
  signatures?: Array<string>;
}

export interface CosmosTxV1beta1GetTxResponse {
  /**
   * tx is the queried transaction.
   */
  tx?: CosmosTxV1beta1Tx;
  tx_response?: {
    height: string;
    txhash: string;
    codespace: string;
    code: number;
    data: string;
    raw_log: string;
    logs: Array<{
      msg_index: number;
      log: string;
      events: Array<{
        type: string;
        attributes: Array<{
          key: string;
          value: string;
        }>;
      }>;
    }>;
    info: string;
    gas_wanted: string;
    gas_used: string;
    tx: {
      type_url: string;
      value: string;
    };
    timestamp: string;
  };
}
