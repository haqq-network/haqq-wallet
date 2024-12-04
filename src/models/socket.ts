import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {AddressUtils} from '@app/helpers/address-utils';
import {Wallet} from '@app/models/wallet';
import {storage} from '@app/services/mmkv';
import {RPCMessage} from '@app/types/rpc';

const HEARTBEAT_INTERVAL_MS = 10_000;
const FALLBACK_INTERVAL_MS = 6_000;
const SOCKET_RECONECT_TIMER_MS = 5_000;

const logger = Logger.create('SocketStore', {stringifyJson: true});

class SocketStore {
  private instance: WebSocket | null = null;
  private messageID: number = 0;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private fallbackIntervalTimer: ReturnType<typeof setInterval> | null = null;
  lastMessage: RPCMessage = {data: {}, type: ''};

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        //@ts-ignore
        properties: ['data'],
        storage,
      });
    }
  }

  private startHeartbeat = () => {
    this.pingTimer = setInterval(() => {
      this.send.ping();
    }, HEARTBEAT_INTERVAL_MS);
  };
  private stopHeartbeat = () => {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  };

  private fallbackToFetch = () => {
    if (this.fallbackIntervalTimer) {
      clearInterval(this.fallbackIntervalTimer);
    }
    this.fallbackIntervalTimer = setInterval(() => {
      Wallet.fetchBalances();
    }, FALLBACK_INTERVAL_MS);
  };

  private stopFallbackFetch = () => {
    if (this.fallbackIntervalTimer) {
      clearInterval(this.fallbackIntervalTimer);
      this.fallbackIntervalTimer = null;
    }
  };

  attach = (url?: string) => {
    // Fallback to default interval if there is no url
    if (!url) {
      this.fallbackToFetch();
      return;
    }

    if (this.instance !== null) {
      return;
    }
    this.instance = new WebSocket(url);
    this.startHeartbeat();

    this.instance.onopen = () => {
      Wallet.getAllVisible().map(wallet => {
        this.send.subscribe(wallet.address);
      });
    };

    this.instance.onmessage = e => {
      const message = JSON.parse(e.data) as RPCMessage;

      runInAction(() => {
        this.lastMessage = message;
      });
    };

    const reconnect = (event?: WebSocketErrorEvent | WebSocketCloseEvent) => {
      logger.error('reconnecting: ', event);

      this.detach();
      setTimeout(() => {
        this.attach(url);
      }, SOCKET_RECONECT_TIMER_MS);
    };

    this.instance.onerror = reconnect;
    this.instance.onclose = reconnect;
  };

  detach = () => {
    if (!this.instance) {
      return;
    }
    this.stopHeartbeat();
    this.stopFallbackFetch();

    try {
      this.instance.close();
    } catch (err) {
      if (err instanceof Error) {
        logger.error('detach error: ', err.message);
      }
    }
    this.instance = null;
  };

  createMessage = (method: string, params: any[]) => {
    if (this.messageID >= Number.MAX_SAFE_INTEGER) {
      this.messageID = 0;
    } else {
      this.messageID++;
    }
    return JSON.stringify({
      jsonrpc: '2.0',
      id: this.messageID,
      method,
      params,
    });
  };

  send = {
    call: (method: string, params: any[]) => {
      const message = this.createMessage(method, params);
      this.instance?.send(message);
    },
    subscribe: (address: string) => {
      const message = this.createMessage('subscribe', [
        AddressUtils.toHaqq(address),
      ]);
      this.instance?.send(message);
    },
    unsubscribe: (address: string) => {
      const message = this.createMessage('unsubscribe', [
        AddressUtils.toHaqq(address),
      ]);
      this.instance?.send(message);
    },
    ping: () => {
      const message = this.createMessage('ping', []);
      if (this.pingTimer) {
        try {
          this.instance?.send(message);
        } catch (err) {
          logger.error('ping error: ', err);
        }
      }
    },
  };
}

const instance = new SocketStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Socket};
