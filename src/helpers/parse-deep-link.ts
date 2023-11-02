import {DeeplinkProtocol} from '@app/types';

import {AddressUtils} from './address-utils';

export enum LinkType {
  Address = 'address',
  Etherium = 'etherium',
  WalletConnect = 'wallet_connect',
  Haqq = 'haqq',
  Unrecognized = 'unrecognized',
}

type CommonResultData = {
  rawData: string;
};

export type LinkParseResult = CommonResultData &
  (
    | {
        type: LinkType.Address;
        params: {
          address: string;
        };
      }
    | {
        type: LinkType.Etherium;
        params: {
          address: string;
        };
      }
    | {
        type: LinkType.WalletConnect;
        params: {
          uri: string;
        };
      }
    | {
        type: LinkType.Haqq;
        params: {
          address?: string;
          key?: string;
          data?: any;
        };
      }
    | {
        type: LinkType.Unrecognized;
        params: {};
      }
  );

export const parseDeepLink = (link: string): LinkParseResult => {
  if (!link) {
    return {type: LinkType.Unrecognized, rawData: '', params: {}};
  }

  if (AddressUtils.isEthAddress(link)) {
    return {type: LinkType.Address, params: {address: link}, rawData: link};
  }

  if (link.startsWith(`${DeeplinkProtocol.etherium}:`)) {
    const to = link.split(':')[1];
    if (AddressUtils.isEthAddress(to)) {
      return {type: LinkType.Etherium, params: {address: to}, rawData: link};
    }
  }

  if (link.startsWith(`${DeeplinkProtocol.wc}:`)) {
    const uri = decodeURIComponent(link.replace(/^wc:\/{0,2}/, ''));
    return {type: LinkType.WalletConnect, params: {uri}, rawData: link};
  }

  if (link.startsWith(`${DeeplinkProtocol.haqq}:`)) {
    let params = link.split(':');

    if (link.startsWith('haqq://wc')) {
      const uri = decodeURIComponent(link.replace('haqq://wc?uri=', ''));
      return {type: LinkType.WalletConnect, params: {uri}, rawData: link};
    }

    if (params[1].startsWith('0x')) {
      return {type: LinkType.Haqq, params: {address: params[1]}, rawData: link};
    }

    const key = params[1].startsWith('//') ? params[1].slice(2) : params[1];
    const data = JSON.parse(atob(params[2]));

    return {
      type: LinkType.Haqq,
      params: {key, data},
      rawData: link,
    };
  }

  return {type: LinkType.Unrecognized, rawData: link, params: {}};
};
