import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {removeLastSlash} from '@app/helpers/url';
import {NetworkProvider} from '@app/services/backend';
import {ISLM_DENOM} from '@app/variables/common';

import {RemoteProviderConfig} from './provider-config';

const HAQQ_BENCH_32_PREFIX = 'haqq';
const EXPLORER_URL_TEMPLATES = {
  ADDRESS: '{{address}}',
  TOKEN_ID: '{{token_id}}',
  TX: '{{tx_hash}}',
};

export class ProviderModel {
  #logger;

  constructor(public model: NetworkProvider) {
    this.#logger = Logger.create(`NetworkProvider:${model.name}`, {
      stringifyJson: true,
    });
  }

  get ethChainIdHex() {
    return '0x' + this.model.chain_id.toString(16);
  }

  get networkVersion() {
    const splitted = this.cosmosChainId.split('-');
    return splitted[1] ?? splitted.shift();
  }

  get id() {
    return this.model.id;
  }

  get name() {
    return this.model.name;
  }

  get icon() {
    return this.model.icon;
  }

  get ethRpcEndpoint() {
    return this.model.entry_point;
  }

  get ethChainId() {
    return this.model.chain_id;
  }

  get cosmosChainId() {
    if (!this.model.cosmos_chain_id) {
      return this.model.chain_id.toString();
    }
    return this.model.cosmos_chain_id;
  }

  get cosmosRestEndpoint() {
    return this.model.cosmos_entry_point;
  }

  get cosmosExplorer() {
    return removeLastSlash(this.model.cosmos_explorer_url ?? '');
  }

  get explorer() {
    return removeLastSlash(this.model.explorer_url ?? '');
  }

  get indexer() {
    return this.model.indexer_url;
  }

  get isEditable() {
    return app.isDeveloper ? true : false;
  }

  get decimals() {
    return this.model.decimals;
  }

  get weiDenom() {
    return this.model.wei_denom;
  }

  get denom() {
    return this.model.denom;
  }

  get isHaqqNetwork() {
    return this.model.denom.toLowerCase() === ISLM_DENOM.toLowerCase();
  }

  get bench32Prefix() {
    return HAQQ_BENCH_32_PREFIX;
  }

  get coinName() {
    return this.model.coin_name;
  }

  get config() {
    return RemoteProviderConfig.getConfig(this.ethChainId);
  }

  toJSON() {
    return {
      ethChainIdHex: this.ethChainIdHex,
      networkVersion: this.networkVersion,
      ethRpcEndpoint: this.ethRpcEndpoint,
      ethChainId: this.ethChainId,
      cosmosChainId: this.cosmosChainId,
      cosmosRestEndpoint: this.cosmosRestEndpoint,
      explorer: this.explorer,
      indexer: this.indexer,
      isEditable: this.isEditable,
      ...this.model,
    };
  }

  getTxExplorerUrl(txHash: string) {
    if (!txHash) {
      return '';
    }

    if (txHash.startsWith('0x') || txHash.startsWith('0X')) {
      return this.config.explorerTxUrl.replace(
        EXPLORER_URL_TEMPLATES.TX,
        txHash,
      );
    }

    return this.config.explorerCosmosTxUrl.replace(
      EXPLORER_URL_TEMPLATES.TX,
      txHash,
    );
  }

  getAddressExplorerUrl(address: string) {
    return this.config.explorerAddressUrl.replace(
      EXPLORER_URL_TEMPLATES.ADDRESS,
      AddressUtils.toEth(address),
    );
  }

  getCollectionExplorerUrl(address: string) {
    return this.config.explorerTokenUrl.replace(
      EXPLORER_URL_TEMPLATES.ADDRESS,
      AddressUtils.toEth(address),
    );
  }

  getTokenExplorerUrl(address: string, tokenId: string | number) {
    return this.config.explorerTokenIdUrl
      .replace(EXPLORER_URL_TEMPLATES.ADDRESS, AddressUtils.toEth(address))
      .replace(EXPLORER_URL_TEMPLATES.TOKEN_ID, tokenId.toString());
  }
}

export type ProviderKeys = keyof Omit<ProviderModel, 'id'>;
