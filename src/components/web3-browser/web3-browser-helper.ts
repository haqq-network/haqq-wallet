import {RefObject} from 'react';

import EventEmitter from 'events';

import {PhishingController} from '@metamask/phishing-controller';
import {JsonRpcEngine, JsonRpcRequest, JsonRpcResponse} from 'json-rpc-engine';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {
  ShouldStartLoadRequest,
  WebViewNavigationEvent,
} from 'react-native-webview/lib/WebViewTypes';

import {DEBUG_VARS} from '@app/debug-vars';
import {WebViewLogger} from '@app/helpers/webview-logger';
import {Web3BrowserSession} from '@app/models/web3-browser-session';

import {
  createJsonRpcLoggerMiddleWare,
  createJsonRpcMiddleware,
} from './json-rpc-middleware';
import {WebViewEventsEnum, WebViewEventsJS} from './scripts';
import {
  EthereumEventsEnum,
  EthereumEventsParams,
  changeWebViewHrefJS,
  detectDeeplinkAndNavigate,
  emitToEthereumJS,
  getOriginFromUrl,
  isJsonRpcRequest,
  isWindowInfoEvent,
  parseWebViewEventData,
  postMessageWebViewJS,
  showPhishingAlert,
} from './web3-browser-utils';

export interface Web3BrowserHelperConstructor {
  webviewRef: RefObject<WebView>;
  initialUrl: string;
}

export class Web3BrowserHelper extends EventEmitter {
  private webviewRef: RefObject<WebView>;
  private jrpcEngine = new JsonRpcEngine();
  private phishingController = new PhishingController();
  private currentUrl: string;
  private nextUrl: string;

  constructor({webviewRef, initialUrl}: Web3BrowserHelperConstructor) {
    super();
    this.webviewRef = webviewRef;
    this.currentUrl = initialUrl;
    this.jrpcEngine.push(
      createJsonRpcMiddleware({
        helper: this,
        useNext: DEBUG_VARS.enableWeb3BrowserLogger,
      }),
    );

    if (DEBUG_VARS.enableWeb3BrowserLogger) {
      this.jrpcEngine.push(createJsonRpcLoggerMiddleWare());
    }
  }

  public get origin() {
    return getOriginFromUrl(this.currentUrl);
  }

  public requestWindowInfo = () => {
    this.webviewRef.current?.injectJavaScript?.(
      WebViewEventsJS.getWindowInformation,
    );
  };

  public onLoad = ({nativeEvent}: WebViewNavigationEvent) => {
    if (this.currentUrl !== nativeEvent.url) {
      this.currentUrl = nativeEvent.url;
      this.requestWindowInfo();
    }
  };

  public handleMessage = async (event: WebViewMessageEvent) => {
    try {
      if (
        DEBUG_VARS.enableWeb3BrowserLogger &&
        WebViewLogger.handleEvent(event, 'Web3Browser')
      ) {
        return;
      }

      const parsedEvent = parseWebViewEventData(event);
      const jsonrpcData = parsedEvent?.data;
      if (isJsonRpcRequest(jsonrpcData)) {
        const result = await this.jrpcEngine.handle(jsonrpcData);
        return this.postMessage(result, parsedEvent?.origin, parsedEvent?.name);
      }

      if (isWindowInfoEvent(parsedEvent)) {
        return this.emit(WebViewEventsEnum.WINDOW_INFO, parsedEvent);
      }
    } catch (err) {
      console.error('🔴 Web3BrowserHelper:handleMessage', err);
    }
  };

  public go = async (url: string) => {
    await this.phishingController.maybeUpdateState();
    const {result} = this.phishingController.test(url);

    if (result) {
      const allowNavigateToPhishing = await showPhishingAlert();
      if (!allowNavigateToPhishing) {
        return;
      }
    }

    if (await detectDeeplinkAndNavigate(url)) {
      return;
    }

    this.nextUrl = url;
    const js = changeWebViewHrefJS(url);
    this.webviewRef?.current?.injectJavaScript(js);
  };

  public onShouldStartLoadWithRequest = ({url}: ShouldStartLoadRequest) => {
    if (this.nextUrl === url) {
      return true;
    } else {
      this.go(url);
      return false;
    }
  };

  public dispose = () => {
    this.jrpcEngine.removeAllListeners();
    this.removeAllListeners();
  };

  public disconnectAccount = () => {
    const session = Web3BrowserSession.getByOrigin(this.origin);
    if (session) {
      session.update({
        selectedAccount: '',
        selectedChainIdHex: '',
        disconected: true,
      });
    }
    this.emitToEthereum(EthereumEventsEnum.DISCONNECT);
  };

  public changeAccount = (accountId: string) => {
    const session = Web3BrowserSession.getByOrigin(this.origin);
    if (session) {
      session.update({
        selectedAccount: accountId,
        disconected: false,
      });
    }
    this.emitToEthereum(EthereumEventsEnum.ACCOUNTS_CHANGED, [accountId]);
  };

  public changeChainId = (chainIdHex: string) => {
    const session = Web3BrowserSession.getByOrigin(this.origin);
    if (session) {
      session.update({
        selectedChainIdHex: chainIdHex,
      });
    }
    this.emitToEthereum(EthereumEventsEnum.CHAIN_CHANGED, chainIdHex);
  };

  private postMessage = (
    data: JsonRpcRequest<any> | JsonRpcResponse<any>,
    origin?: string,
    providerName?: string,
  ) => {
    if (!origin) {
      origin = this.origin;
    }

    if (!providerName) {
      providerName = 'metamask-provider';
    }

    const message = {
      data,
      origin,
      name: providerName,
    };

    const js = postMessageWebViewJS(message, origin);
    this.webviewRef?.current?.injectJavaScript?.(js);
  };

  private emitToEthereum = <EventName extends EthereumEventsEnum>(
    event: EventName,
    params?: EthereumEventsParams[EventName],
  ) => {
    const js = emitToEthereumJS(event, params);
    this.webviewRef.current?.injectJavaScript?.(js);
  };
}
