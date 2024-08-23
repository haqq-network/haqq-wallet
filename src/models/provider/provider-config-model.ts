import {ProviderConfig} from '@app/services/indexer';

export class ProviderConfigModel {
  constructor(public config: ProviderConfig) {}

  get isNftEnabled() {
    return Boolean(this.config?.nft_exists);
  }

  get isBech32Enabled() {
    return Boolean(this.config?.bech32_exists);
  }

  get swapEnabled() {
    return Boolean(this.config?.swap_enabled);
  }
  get swapRouterV3() {
    return this.config?.swap_router_v3 ?? '';
  }
  get wethAddress() {
    return this.config?.weth_address ?? '';
  }

  get wethSymbol() {
    return this.config?.weth_symbol ?? '';
  }

  /**
   * Get the EVM explorer URL template for an address.
   * @returns {string} The explorer address URL template or an empty string if not configured.
   * Usage: Replace {{address}} with the actual address.
   * @example "https://explorer.haqq.network/address/{{address}}"
   */
  get explorerAddressUrl() {
    return this.config?.explorer_address_url ?? '';
  }

  /**
   * Get the explorer URL template for a Cosmos transaction.
   * @returns {string} The explorer Cosmos transaction URL template or an empty string if not configured.
   * Usage: Replace {{tx_hash}} with the actual transaction hash.
   * @example "https://ping.pub/haqq/tx/{{tx_hash}}"
   */
  get explorerCosmosTxUrl() {
    return this.config?.explorer_cosmos_tx_url ?? '';
  }

  /**
   * Get the EVM explorer URL template for a token.
   * @returns {string} The explorer token URL template or an empty string if not configured.
   * Usage: Replace {{address}} with the actual token address.
   * @example "https://explorer.haqq.network/token/{{address}}"
   */
  get explorerTokenUrl() {
    return this.config?.explorer_token_url ?? '';
  }

  /**
   * Get the EVM explorer URL template for a transaction.
   * @returns {string} The explorer transaction URL template or an empty string if not configured.
   * Usage: Replace {{tx_hash}} with the actual transaction hash.
   * @example "https://explorer.haqq.network/tx/{{tx_hash}}"
   */
  get explorerTxUrl() {
    return this.config?.explorer_tx_url ?? '';
  }

  /**
   * Get the EVM explorer URL template for a token ID.
   * @returns {string} The explorer token ID URL template or an empty string if not configured.
   * Usage: Replace {{address}} with the token contract address and {{token_id}} with the token ID.
   * @example "https://explorer.haqq.network/token/{{address}}/instance/{{token_id}}"
   */
  get explorerTokenIdUrl() {
    return this.config?.explorer_token_id_url ?? '';
  }
}
