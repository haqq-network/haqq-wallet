import Url from 'url-parse';

import {ParsedQuery} from '@app/event-actions/on-deep-link';
import {DeeplinkProtocol, DeeplinkUrlKey} from '@app/types';

import {AddressUtils} from './address-utils';

export enum LinkType {
  Address = 'address',
  Etherium = 'etherium',
  WalletConnect = 'wallet_connect',
  Haqq = 'haqq',
  Unrecognized = 'unrecognized',
  Browser = 'browser',
  EnableDeveloperMode = 'enableDeveloperMode',
  Back9test = 'back9test',
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
    | {
        type: LinkType.Browser;
        params: {
          url: string;
          key: DeeplinkUrlKey.browser | DeeplinkUrlKey.web3browser;
        };
      }
    | {
        type: LinkType.Back9test;
        params: {
          code: string;
        };
      }
    | {
        type: LinkType.EnableDeveloperMode;
        params: {};
      }
  );

export const parseDeepLink = (link: string): LinkParseResult => {
  try {
    if (!link) {
      return {type: LinkType.Unrecognized, rawData: '', params: {}};
    }

    if (AddressUtils.isEthAddress(link)) {
      return {type: LinkType.Address, params: {address: link}, rawData: link};
    }

    if (link.startsWith(`${DeeplinkProtocol.ethereum}:`)) {
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
      const url = new Url<ParsedQuery>(link, true);

      const [key, ...params] = (url.host || url.pathname || url.hostname).split(
        ':',
      );

      if (AddressUtils.isValidAddress(key)) {
        return {
          type: LinkType.Address,
          params: {address: key},
          rawData: link,
        };
      }

      switch (key) {
        case DeeplinkUrlKey.wc:
          return {
            type: LinkType.WalletConnect,
            params: {uri: url.query.uri!},
            rawData: link,
          };
        case DeeplinkUrlKey.browser:
        case DeeplinkUrlKey.web3browser:
          return {
            type: LinkType.Browser,
            params: {
              key,
              url: url.query.uri!,
            },
            rawData: link,
          };
        case DeeplinkUrlKey.back9test:
          return {
            type: LinkType.Back9test,
            params: {
              code: params[0],
            },
            rawData: link,
          };
        case DeeplinkUrlKey.enableDeveloperMode:
          return {
            type: LinkType.EnableDeveloperMode,
            params: {},
            rawData: link,
          };
      }

      return {
        type: LinkType.Haqq,
        params: {key, ...params},
        rawData: link,
      };
    }
  } catch (e) {
    Logger.captureException(e, 'parseDeepLink', {link});
  }

  return {type: LinkType.Unrecognized, rawData: link, params: {}};
};
