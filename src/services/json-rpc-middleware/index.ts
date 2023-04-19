import {JsonRpcError, createAsyncMiddleware} from 'json-rpc-engine';

import {WebViewEventsEnum} from '@app/components/web3-browser/scripts';
import {Web3BrowserHelper} from '@app/components/web3-browser/web3-browser-helper';

import {JsonRpcMethodsHandlers} from './json-rpc-methods-handlers';

type CreateJsonRpcMiddlewareParams = {
  helper: Web3BrowserHelper;
  // if in the engine has less than one middleware `next` method is crash app
  useNext?: boolean;
};

export const createJsonRpcMiddleware = ({
  helper,
  useNext,
}: CreateJsonRpcMiddlewareParams) => {
  return createAsyncMiddleware(async (req, res, next) => {
    try {
      const handler = JsonRpcMethodsHandlers[req.method];

      if (!handler) {
        res.error = {
          code: -32601,
          message: 'Method not implemented',
        };
        console.log(
          `🔴 JRPC ${req.method} not implemented, params:`,
          JSON.stringify(req.params, null, 2),
        );
        return;
      }

      res.result = await handler({req, helper});

      if (req.method === 'eth_requestAccounts' && Array.isArray(res.result)) {
        helper.emit(WebViewEventsEnum.ACCOUNTS_CHANGED, [...res.result]);
      }
    } catch (err) {
      // @ts-ignore
      if (typeof err.code === 'number' && typeof err.message === 'string') {
        res.error = err as JsonRpcError;
      } else {
        console.error('🔴 json rpc middleware error', req, err);
      }
    }

    // if in the engine has less than one middleware then this is crash app
    if (useNext) {
      await next();
    }
  });
};

export const createJsonRpcLoggerMiddleWare = () => {
  return createAsyncMiddleware(async (req, res) => {
    console.log(
      `🟣 JRPC ${req.id} ${req.method} \nPARAMS:  ${JSON.stringify(
        req.params || '{}',
        null,
        2,
      )}\nRESULT: ${JSON.stringify(res.result || res.error || '{}', null, 2)}
          `,
    );
  });
};
