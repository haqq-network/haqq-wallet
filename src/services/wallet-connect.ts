import {EventEmitter} from 'events';

import {WALLET_CONNECT_PROJECT_ID, WALLET_CONNECT_RELAY_URL} from '@env';
import {Core} from '@walletconnect/core';
import {ICore, SignClientTypes} from '@walletconnect/types';
import {
  buildApprovedNamespaces,
  getSdkError,
  parseUri,
} from '@walletconnect/utils';
import {IWeb3Wallet, Web3Wallet} from '@walletconnect/web3wallet';

import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {Events, WalletConnectEvents} from '@app/events';
import {showModal} from '@app/helpers';
import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {Initializable} from '@app/helpers/initializable';
import {Url} from '@app/helpers/url';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesString} from '@app/models/variables-string';
import {WalletConnectSessionMetadata} from '@app/models/wallet-connect-session-metadata';
import {message as sendMessage, sendNotification} from '@app/services/toast';
import {ModalType} from '@app/types';
import {filterWalletConnectSessionsByAddress, isError, sleep} from '@app/utils';

import {AppUtils} from './app-utils';
import {PushNotifications} from './push-notifications';
import {RemoteConfig} from './remote-config';

export type WalletConnectEventTypes = keyof SignClientTypes.EventArguments;

const logger = Logger.create('WalletConnect', {
  enabled: DEBUG_VARS.enableWalletConnectLogger,
  stringifyJson: true,
  emodjiPrefix: '⚪️',
});

const PAIRING_URLS_KEY = 'wallet_connect_pairing_urls';

export class WalletConnect extends Initializable {
  static instance = new WalletConnect();
  private _client: IWeb3Wallet | null = null;
  private _core: ICore | null = null;
  private _initAttempts = 0;
  private _initStartTime = 0;
  private _handledJsonRpcEvents = new Map<string, boolean>();

  public getActiveSessions() {
    return this._client?.engine?.signClient?.session?.getAll?.() || [];
  }

  public async disconnectSession(topic: string) {
    await this.awaitForInitialization();
    WalletConnectSessionMetadata.remove(topic);
    return this._client?.disconnectSession?.({
      reason: getSdkError('USER_DISCONNECTED'),
      topic,
    });
  }

  public async init(): Promise<void> {
    try {
      this.startInitialization();
      if (!this._initStartTime) {
        this._initStartTime = Date.now();
      }
      this._initAttempts++;
      logger.log(
        'WalletConnect:init',
        WALLET_CONNECT_PROJECT_ID,
        WALLET_CONNECT_RELAY_URL,
      );

      if (this._client) {
        logger.warn('WalletConnect:init already initialized');
      }

      this._core = new Core({
        logger: DEBUG_VARS.enableWalletConnectLogger ? 'debug' : 'error',
        projectId: WALLET_CONNECT_PROJECT_ID,
        relayUrl: WALLET_CONNECT_RELAY_URL,
      });

      this._client = await Web3Wallet.init({
        core: this._core,
        metadata: {
          name: 'HAQQ Wallet',
          description: 'HAQQ Wallet for WalletConnect',
          url: 'https://islamiccoin.net/',
          icons: ['https://islamiccoin.net/favicon.ico'],
        },
      });

      this._emitActiveSessions();

      this
        // https://docs.walletconnect.com/2.0/javascript/web3wallet/wallet-usage#responding-to-session-requests
        ._walletConnectOnEvent('session_proposal', proposal => {
          logger.log('🟢 session_proposal', proposal);
          app.emit(Events.onWalletConnectApproveConnection, proposal);
        })
        // https://docs.walletconnect.com/2.0/javascript/web3wallet/wallet-usage#responding-to-session-requests
        .on('session_request', async event => {
          const handledKey = `${event.id}-${event.topic}`;
          if (this._handledJsonRpcEvents.get(handledKey)) {
            return logger.log('🟣 session_request already in progress', event);
          }
          this._handledJsonRpcEvents.set(handledKey, true);
          logger.log('🟢 session_request', event);
          app.emit(Events.onWalletConnectSignTransaction, event);
        })
        // https://docs.walletconnect.com/2.0/javascript/web3wallet/wallet-usage#extend-a-session
        .on('session_update', async event => {
          logger.log('🟢 session_update', JSON.stringify(event, null, 2));
          await this._client?.extendSession?.({topic: event?.topic});
          this._emitActiveSessions();
        })
        .on('session_expire', this._emitActiveSessions.bind(this))
        .on('session_delete', this._emitActiveSessions.bind(this))
        .on('session_request_expire', async ({id}) => {
          try {
            await this.rejectSession(id, 'Session request expired');
          } catch (err) {
            logger.error('session_request_expire', err);
          }
          this._emitActiveSessions.bind(this);
        });

      this._core.relayer.on('relayer_connect', async () => {
        // connection to the relay server is established
        logger.log('🟢 relayer_connect');
        sendNotification(I18N.walletConnectConnectionEstablished);
      });
      this._core.relayer.on('relayer_disconnect', async () => {
        // connection to the relay server is lost
        logger.log('🔴 relayer_disconnect');
        sendNotification(I18N.walletConnectConnectionLost);
      });

      // this event called when user disconect from web site
      this._client.core.expirer.on(
        'expirer_deleted',
        this._emitActiveSessions.bind(this),
      );

      app.on(Events.onProviderChanged, async (providerId: string) => {
        const provider = Provider.getById(providerId)!;
        const chainId = provider.ethChainId;
        await this.awaitForInitialization();
        WalletConnectSessionMetadata.getAll().forEach(async ({topic}) => {
          try {
            await this._client?.emitSessionEvent({
              topic,
              event: {
                name: 'chainChanged',
                data: chainId,
              },
              chainId: `eip155:${chainId}`,
            });
          } catch (err) {
            logger.error('send event chainChanged', {topic}, err);
          }
        });
      });

      const end = Date.now();
      const initDuration = end - this._initStartTime;
      logger.log(
        `WalletConnect:init duration in ${initDuration}ms, attempts: ${this._initAttempts}`,
      );

      if (app.isTesterMode || app.isDeveloper) {
        sendMessage(
          `WC init: ${initDuration}ms, , attempts: ${this._initAttempts}`,
        );
      }
      const token = await PushNotifications.instance.getToken(true);
      if (token) {
        this.setupPushNotifications(token);
      } else {
        logger.log('FCM token not found, push notifiactions disabled!');
      }
      this.stopInitialization();
    } catch (err) {
      if (err instanceof Error) {
        logger.error('[WalletConnect] init error', err);
        logger.captureException(err, 'WalletConnect:init');
        await sleep(5000);
        return WalletConnect.instance._reInit();
      }
    }
  }

  public async setupPushNotifications(token: string) {
    try {
      logger.log('setupPushNotifications: token', token);
      await this.awaitForInitialization();
      const clientId = await this._client?.core?.crypto?.getClientId();
      if (clientId) {
        await this._client?.registerDeviceToken({
          token,
          clientId,
          notificationType: 'fcm',
          // flag that enabled detailed notifications
          enableEncrypted: false,
        });
      } else {
        logger.error('setupPushNotifications: clientId not found');
      }
    } catch (err) {
      logger.error('setupPushNotifications', err);
    }
  }

  /**
   * @description Get all paired urls
   * @returns {Record<string, boolean>} - paired urls, key - url, value - paired or not paired
   */
  public getPairedUrls() {
    return (
      VariablesString.getObject<Record<string, boolean>>(PAIRING_URLS_KEY) || {}
    );
  }

  public async handleRequest(uri: string) {
    try {
      const {query} = new Url<{sessionTopic: string; requestId: string}>(
        uri,
        true,
      );
      if (!query?.sessionTopic && !query?.requestId) {
        return false;
      }
      const session = this.getSessionByTopic(query.sessionTopic);
      if (session) {
        await this._reInit();
      }

      return true;
    } catch (err) {
      logger.error('handleRequest', err);
    }
    return false;
  }

  public async pair(uri: string) {
    try {
      await this.awaitForInitialization();
      const pairedUrls = this.getPairedUrls();
      if (!uri?.startsWith('wc:')) {
        uri = `wc:${uri}`;
      }
      const exists = !!pairedUrls[uri];
      const {topic} = parseUri(uri) || {};

      if (!this._client || !this._core) {
        showModal(ModalType.error, {
          title: getText(I18N.walletConnectErrorTitle),
          description: getText(I18N.walletConnectPairInitError),
          close: getText(I18N.walletConnectErrorClose),
        });
        return;
      }

      if (
        exists ||
        this._core?.pairing?.pairings?.keys?.includes(topic) ||
        this._core?.crypto.keychain.has(topic)
      ) {
        VariablesString.setObject(PAIRING_URLS_KEY, {
          ...pairedUrls,
          [uri]: false,
        });
        try {
          await this.disconnectSession(topic);
        } catch {}
        showModal(ModalType.error, {
          title: getText(I18N.walletConnectErrorTitle),
          description: getText(I18N.walletConnectPairAlreadyExists),
          close: getText(I18N.walletConnectErrorClose),
        });
        return;
      }

      const resp = await this._core.pairing.pair({uri, activatePairing: false});

      if (!resp) {
        showModal(ModalType.error, {
          title: getText(I18N.walletConnectErrorTitle),
          description: getText(I18N.walletConnectPairError),
          close: getText(I18N.walletConnectErrorClose),
        });
      } else {
        await this._core?.pairing?.activate({topic});
        VariablesString.setObject(PAIRING_URLS_KEY, {
          ...pairedUrls,
          [uri]: true,
        });
      }
      logger.log('WalletConnect:pair ', resp);
    } catch (err) {
      if (isError(err)) {
        showModal(ModalType.error, {
          title: getText(I18N.walletConnectErrorTitle),
          description: err.message || err.name || err.toString(),
          close: getText(I18N.walletConnectErrorClose),
        });
        // @ts-ignore
        logger.captureException(err, 'WalletConnect.pair', {resp});
        await this._reInit();
      }
    }
  }

  public async rejectSession(eventId: number, message?: string) {
    await this.awaitForInitialization();
    return this._client?.rejectSession?.({
      id: eventId,
      reason: getSdkError('USER_REJECTED', message),
    });
  }

  public async rejectSessionRequest(
    eventId: number,
    topic: string,
    message?: string,
  ) {
    await this.awaitForInitialization();
    await this._client?.respondSessionRequest({
      topic,
      response: {
        id: eventId,
        jsonrpc: '2.0',
        error: getSdkError('USER_REJECTED', message),
      },
    });
    this.redirect();
  }

  public async approveSession(
    proposalId: number,
    currentETHAddress: string,
    params: SignClientTypes.EventArguments['session_proposal']['params'],
  ) {
    await this.awaitForInitialization();

    if (!this._client) {
      return;
    }

    const address = currentETHAddress || getLeadingAccount()?.address;
    const walletConnectConfig = RemoteConfig.safeGet('wallet_connect');
    const namespaces = buildApprovedNamespaces({
      proposal: params,
      supportedNamespaces: Object.entries(walletConnectConfig).reduce(
        (prev, [namespace, opts]) => ({
          ...prev,
          [namespace]: {
            ...opts,
            accounts: opts.chains?.map(chain => `${chain}:${address}`),
          },
        }),
        {},
      ),
    });

    logger.log('-> namespaces', namespaces);

    const session = await this._client.approveSession({
      id: proposalId,
      namespaces,
    });

    WalletConnectSessionMetadata.create(session.topic);
    this._emitActiveSessions();
    this.redirect();
    return session;
  }

  public getSessionByTopic(topic: string) {
    return this._client?.engine?.signClient?.session?.get?.(topic);
  }

  public async approveSessionRequest(
    result: any,
    event: SignClientTypes.EventArguments['session_request'],
  ) {
    await this.awaitForInitialization();
    if (!result) {
      throw new Error(
        '[WalletConnect:approveEIP155Request]: result is undefined',
      );
    }

    logger.log('✅ approveSessionRequest result:', result);

    const isDisconnected = !this.getSessionByTopic(event?.topic);
    if (isDisconnected) {
      return this.rejectSessionRequest(event?.id, event?.topic);
    }

    return this._client?.respondSessionRequest({
      topic: event.topic,
      response: {id: event.id, result, jsonrpc: '2.0'},
    });
  }

  onWalletRemove(accountId: string) {
    try {
      const sessionsAccouts = filterWalletConnectSessionsByAddress(
        this.getActiveSessions(),
        accountId,
      );

      if (sessionsAccouts?.length) {
        sessionsAccouts.forEach(({topic}) => {
          this.disconnectSession(topic);
        });
      }
    } catch (err) {
      logger.captureException(err, 'wc:onWalletRemove', {accountId});
    }
  }

  private redirect() {
    const isWalletConnectFromDeepLink = VariablesBool.get(
      'isWalletConnectFromDeepLink',
    );
    if (isWalletConnectFromDeepLink) {
      VariablesBool.set('isWalletConnectFromDeepLink', false);
      setTimeout(() => {
        AppUtils.goBack();
      }, 500);
    }
  }

  private _emitActiveSessions() {
    this.emit(WalletConnectEvents.onSessionsChange, this.getActiveSessions());
  }

  private async _reInit() {
    if (this._core?.relayer?.connected) {
      await this._core?.relayer?.transportClose?.();
    }
    this._core = null;
    this._client = null;
    await this.init();
  }

  // typed fix for `Web3Wallet.on`
  private _walletConnectOnEvent<EventName extends WalletConnectEventTypes>(
    eventName: EventName,
    cb: (event: SignClientTypes.EventArguments[EventName]) => void,
  ) {
    // @ts-ignore
    return this._client?.on?.(eventName, cb) as unknown as Omit<
      EventEmitter,
      'on'
    > & {
      on: typeof WalletConnect.instance._walletConnectOnEvent;
    };
  }
}
