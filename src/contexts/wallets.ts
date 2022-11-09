import {createContext, useContext, useEffect, useState} from 'react';
import {EventEmitter} from 'events';
import {realm} from '../models';
import {Wallet, WalletRealm} from '../models/wallet';
import {app} from './app';
import {
  Mnemonic,
  WalletCardPattern,
  WalletCardStyle,
  WalletType,
} from '../types';
import {
  generateFlatColors,
  generateGradientColors,
  getPatternName,
  sleep,
} from '../utils';
import {encrypt} from '../passworder';
import {
  CARD_CIRCLE_TOTAL,
  CARD_DEFAULT_STYLE,
  CARD_RHOMBUS_TOTAL,
  FLAT_PRESETS,
  GRADIENT_PRESETS,
  DEFAULT_CARD_BACKGROUND,
  DEFAULT_CARD_PATTERN,
} from '../variables';
import {isAfter} from 'date-fns';
import {Image} from 'react-native';
import {captureException} from '../helpers';
import {
  restoreFromMnemonic,
  restoreFromPrivateKey,
} from '../services/eth-utils';

const cards = [WalletCardStyle.flat, WalletCardStyle.gradient];
const patterns = [WalletCardPattern.circle, WalletCardPattern.rhombus];

const defaultData = {
  data: '',
  name: '',
  mnemonicSaved: true,
  isHidden: false,
  cardStyle: WalletCardStyle.flat,
  colorFrom: DEFAULT_CARD_BACKGROUND,
  colorTo: DEFAULT_CARD_BACKGROUND,
  colorPattern: DEFAULT_CARD_PATTERN,
  pattern: CARD_DEFAULT_STYLE,
  type: WalletType.hot,
  deviceId: undefined,
  deviceName: undefined,
};

type AddWalletParams = {address: string} & (
  | {
      type: WalletType.hot;
      privateKey: string;
      mnemonic?: Mnemonic;
    }
  | {
      type: WalletType.ledgerBt;
      deviceId: string;
      deviceName: string;
    }
);

class Wallets extends EventEmitter {
  private _wallets: Map<string, Wallet>;
  private _initialized: boolean = false;

  constructor() {
    super();
    this._wallets = new Map();
    const wallets = realm.objects<WalletRealm>('Wallet');

    for (const rawWallet of wallets) {
      try {
        this.attachWallet(new Wallet(rawWallet));
      } catch (e) {
        if (e instanceof Error) {
          console.log(rawWallet, e.message);
        }
      }
    }
  }

  async init(snoozeBackup: Date): Promise<void> {
    if (this._initialized) {
      return;
    }

    this._initialized = true;

    const password = await app.getPassword();

    await Promise.all(
      Array.from(this._wallets.values())
        .filter(w => w.isEncrypted)
        .map(w => w.decrypt(password)),
    );

    Promise.all(
      Array.from(this._wallets.values()).map(w =>
        Image.prefetch(getPatternName(w.pattern)),
      ),
    ).then(() => {
      console.log('image prefetched');
    });

    this.onChangeWallet();
    await this.checkForBackup(snoozeBackup);
  }

  async checkForBackup(snoozeBackup: Date) {
    if (isAfter(new Date(), snoozeBackup)) {
      const backupMnemonic = Array.from(this._wallets.values()).find(
        w => !w.mnemonicSaved && !w.isHidden,
      );

      if (backupMnemonic) {
        await sleep(1000);
        this.emit('backupMnemonic', backupMnemonic);
      }
    }
  }

  attachWallet(wallet: Wallet) {
    wallet.addListener('change', this.onChangeWallet);
    this._wallets.set(wallet.address, wallet);
    this.onChangeWallet();
  }

  deAttachWallet(wallet: Wallet) {
    wallet.removeListener('change', this.onChangeWallet);
    this._wallets.delete(wallet.address);
    this.onChangeWallet();
  }

  onChangeWallet = () => {
    this.emit('wallets');
  };

  addWalletFromLedger(
    {
      address,
      deviceId,
      deviceName,
    }: {address: string; deviceId: string; deviceName: string},
    name?: string,
  ): Promise<Wallet | null> {
    return this.addWallet(
      {
        type: WalletType.ledgerBt,
        deviceId,
        deviceName,
        address,
      },
      name,
    );
  }

  async addWalletFromMnemonic(
    mnemonic: string,
    name?: string,
  ): Promise<Wallet | null> {
    const node = await restoreFromMnemonic(mnemonic);

    return this.addWallet(
      {
        address: node.address,
        type: WalletType.hot,
        privateKey: node.privateKey,
        mnemonic: node.mnemonic,
      },
      name,
    );
  }

  async addWalletFromPrivateKey(
    privateKey: string,
    name = '',
  ): Promise<Wallet | null> {
    const node = await restoreFromPrivateKey(privateKey);

    return this.addWallet(
      {
        address: node.address,
        type: WalletType.hot,
        privateKey: node.privateKey,
      },
      name,
    );
  }

  async addWallet(walletParams: AddWalletParams, name = '') {
    const exist = realm.objectForPrimaryKey<Wallet>(
      'Wallet',
      walletParams.address,
    );
    if (exist) {
      return Promise.reject('wallet_already_exists');
    }
    try {
      let data = '';

      if (walletParams.type === WalletType.hot) {
        const password = await app.getPassword();
        data = await encrypt(password, walletParams);
      }

      const cardStyle = cards[
        this._wallets.size % cards.length
      ] as WalletCardStyle;

      const patternVariant = patterns[this._wallets.size % cards.length];

      const pattern = `${patternVariant}-${Math.floor(
        Math.random() *
          (patternVariant === WalletCardPattern.circle
            ? CARD_CIRCLE_TOTAL
            : CARD_RHOMBUS_TOTAL),
      )}`;

      const usedColors = new Set(
        [...this._wallets.values()].map(w => w.colorFrom),
      );

      let availableColors = (
        cardStyle === WalletCardStyle.flat ? FLAT_PRESETS : GRADIENT_PRESETS
      ).filter(c => !usedColors.has(c[0]));

      const generatedColors =
        cardStyle === WalletCardStyle.flat
          ? generateFlatColors()
          : generateGradientColors();

      const colors = availableColors.length
        ? availableColors[Math.floor(Math.random() * availableColors.length)]
        : generatedColors;

      let result = null;
      realm.write(() => {
        result = realm.create<WalletRealm>('Wallet', {
          ...defaultData,
          data: data,
          address: walletParams.address,
          mnemonicSaved: !(
            walletParams.type === WalletType.hot &&
            walletParams.mnemonic !== undefined
          ),
          name: name ?? defaultData.name,
          pattern,
          cardStyle,
          colorFrom: colors[0],
          colorTo: colors[1],
          colorPattern: colors[2],
          type: walletParams.type,
          deviceId:
            walletParams.type === WalletType.ledgerBt
              ? walletParams.deviceId
              : undefined,
          deviceName:
            walletParams.type === WalletType.ledgerBt
              ? walletParams.deviceName
              : undefined,
        });
      });

      if (result) {
        const wallet = new Wallet(result);
        if (wallet.isEncrypted) {
          const password = await app.getPassword();
          await wallet.decrypt(password);
        }

        this.attachWallet(wallet);
        this.onChangeWallet();

        requestAnimationFrame(() => {
          app.emit('addWallet', wallet.address);
        });

        return wallet;
      }
    } catch (e) {
      captureException(e, 'createWallet');
    }

    return null;
  }

  async removeWallet(address: string) {
    const wallet = this._wallets.get(address);

    if (wallet) {
      const realmWallet = realm.objectForPrimaryKey<WalletRealm>(
        'Wallet',
        address,
      );

      this.deAttachWallet(wallet);
      if (realmWallet) {
        realm.write(() => {
          realm.delete(realmWallet);
        });
      }
    }

    requestAnimationFrame(() => {
      const realmWallet = realm.objectForPrimaryKey<WalletRealm>(
        'Wallet',
        address,
      );
      if (!realmWallet) {
        app.emit('removeWallet', address);
      }
    });
  }

  clean() {
    this._wallets = new Map();
    this.emit('wallets');
    const wallets = realm.objects<WalletRealm>('Wallet');

    for (const wallet of wallets) {
      realm.write(() => {
        realm.delete(wallet);
      });
    }
  }

  async updateWalletsData(pin: string) {
    for (const wallet of this._wallets.values()) {
      await wallet.updateWalletData(pin);
    }
  }

  getWallet(address: string): Wallet | undefined {
    return this._wallets.get(address);
  }

  getWallets(): Wallet[] {
    return Array.from(this._wallets.values());
  }

  getSize() {
    return this._wallets.size;
  }

  get visible() {
    return Array.from(this._wallets.values()).filter(w => !w.isHidden);
  }

  get addressList(): string[] {
    return Array.from(this._wallets.keys());
  }

  checkBalance() {
    return Promise.all([...this._wallets.values()].map(w => w.checkBalance()));
  }
}

export const wallets = new Wallets();

export const WalletsContext = createContext(wallets);

export function useWallets() {
  const context = useContext(WalletsContext);

  return context;
}

export function useWallet(address: string) {
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const [_date, setDate] = useState(new Date());
  const [wallet, setWallet] = useState(wallets.getWallet(address));

  useEffect(() => {
    setDate(new Date());
    setWallet(wallets.getWallet(address));
  }, [address]);

  useEffect(() => {
    const subscription = () => {
      setDate(new Date());
    };

    wallet?.on('change', subscription);

    return () => {
      wallet?.off('change', subscription);
    };
  }, [wallet, address]);

  return wallet;
}
