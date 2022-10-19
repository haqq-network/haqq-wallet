import {BleManager, State} from 'react-native-ble-plx';
import {EventEmitter} from 'events';
import {createContext, useContext} from 'react';
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}
class Ledger extends EventEmitter {
  private bleManager: BleManager;
  private _state: State;
  constructor() {
    super();

    this.bleManager = new BleManager();
    this.bleManager.onStateChange(this.onStateChange);

    this._state = State.Unknown;
  }

  async init() {
    this.state = await this.bleManager.state();
  }

  private onStateChange(newState: State) {
    this.state = newState;
  }

  set state(newValue) {
    this._state = newValue;
    this.emit('stateChange', this._state);
  }

  get state() {
    return this._state;
  }
}

export const ledger = new Ledger();

export const LedgerContext = createContext(ledger);

export function useLedger() {
  const context = useContext(LedgerContext);

  return context;
}
