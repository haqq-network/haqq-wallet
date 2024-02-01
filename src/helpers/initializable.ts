import EventEmitter from 'events';

export class Initializable<InitResult = null> extends EventEmitter {
  private _started = false;
  private _handler: Promise<InitResult> | null = null;

  private _initialized: boolean = false;

  get initialized(): boolean {
    return this._initialized;
  }

  startInitialization(): void {
    if (this._started) {
      return;
    }
    this._started = true;
    this._handler = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  async awaitForInitialization(): Promise<InitResult> {
    if (!this._started) {
      this.startInitialization();
    }
    return this._handler!;
  }

  stopInitialization(value?: InitResult): void {
    this._resolve(value as InitResult);
  }

  rejectInitialization(): void {
    this._reject();
    this._started = false;
    this._handler = null;
  }

  private _resolve = (_: InitResult) => {};

  private _reject = () => {};
}
