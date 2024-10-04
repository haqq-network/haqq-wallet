import {
  HaqqCosmosAddress,
  HaqqEthereumAddress,
  WalletCardStyle,
  WalletType,
} from '../../types';

export class WalletModel {
  private _address: HaqqEthereumAddress;
  private _name: string;
  private _data: string;
  private _mnemonicSaved: boolean;
  private _socialLinkEnabled: boolean;
  private _cardStyle: WalletCardStyle;
  private _colorFrom: string;
  private _colorTo: string;
  private _colorPattern: string;
  private _pattern: string;
  private _isHidden: boolean;
  private _isMain: boolean;
  private _type: WalletType;
  private _deviceId?: string;
  private _path?: string;
  private _rootAddress?: string;
  private _subscription: string | null;
  private _version: number;
  private _accountId: string | null;
  private _cosmosAddress: HaqqCosmosAddress;
  private _position: number;
  private _isImported?: boolean;

  constructor(props: {
    address: HaqqEthereumAddress;
    name: string;
    data: string;
    mnemonicSaved: boolean;
    socialLinkEnabled: boolean;
    cardStyle: WalletCardStyle;
    colorFrom: string;
    colorTo: string;
    colorPattern: string;
    pattern: string;
    isHidden: boolean;
    isMain: boolean;
    type: WalletType;
    deviceId?: string;
    path?: string;
    rootAddress?: string;
    subscription: string | null;
    version: number;
    accountId: string | null;
    cosmosAddress: HaqqCosmosAddress;
    position: number;
    isImported?: boolean;
  }) {
    this._address = props.address;
    this._name = props.name;
    this._data = props.data;
    this._mnemonicSaved = props.mnemonicSaved;
    this._socialLinkEnabled = props.socialLinkEnabled;
    this._cardStyle = props.cardStyle;
    this._colorFrom = props.colorFrom;
    this._colorTo = props.colorTo;
    this._colorPattern = props.colorPattern;
    this._pattern = props.pattern;
    this._isHidden = props.isHidden;
    this._isMain = props.isMain;
    this._type = props.type;
    this._deviceId = props.deviceId;
    this._path = props.path;
    this._rootAddress = props.rootAddress;
    this._subscription = props.subscription;
    this._version = props.version;
    this._accountId = props.accountId;
    this._cosmosAddress = props.cosmosAddress;
    this._position = props.position;
    this._isImported = props.isImported;
  }

  public get address(): HaqqEthereumAddress {
    return this._address;
  }
  public set address(value: HaqqEthereumAddress) {
    this._address = value;
  }
  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
  }
  public get data(): string {
    return this._data;
  }
  public set data(value: string) {
    this._data = value;
  }
  public get mnemonicSaved(): boolean {
    return this._mnemonicSaved;
  }
  public set mnemonicSaved(value: boolean) {
    this._mnemonicSaved = value;
  }
  public get socialLinkEnabled(): boolean {
    return this._socialLinkEnabled;
  }
  public set socialLinkEnabled(value: boolean) {
    this._socialLinkEnabled = value;
  }
  public get cardStyle(): WalletCardStyle {
    return this._cardStyle;
  }
  public set cardStyle(value: WalletCardStyle) {
    this._cardStyle = value;
  }
  public get colorFrom(): string {
    return this._colorFrom;
  }
  public set colorFrom(value: string) {
    this._colorFrom = value;
  }
  public get colorTo(): string {
    return this._colorTo;
  }
  public set colorTo(value: string) {
    this._colorTo = value;
  }
  public get colorPattern(): string {
    return this._colorPattern;
  }
  public set colorPattern(value: string) {
    this._colorPattern = value;
  }
  public get pattern(): string {
    return this._pattern;
  }
  public set pattern(value: string) {
    this._pattern = value;
  }
  public get isHidden(): boolean {
    return this._isHidden;
  }
  public set isHidden(value: boolean) {
    this._isHidden = value;
  }
  public get isMain(): boolean {
    return this._isMain;
  }
  public set isMain(value: boolean) {
    this._isMain = value;
  }
  public get type(): WalletType {
    return this._type;
  }
  public set type(value: WalletType) {
    this._type = value;
  }
  public get deviceId(): string | undefined {
    return this._deviceId;
  }
  public set deviceId(value: string | undefined) {
    this._deviceId = value;
  }
  public get path(): string | undefined {
    return this._path;
  }
  public set path(value: string | undefined) {
    this._path = value;
  }
  public get rootAddress(): string | undefined {
    return this._rootAddress;
  }
  public set rootAddress(value: string | undefined) {
    this._rootAddress = value;
  }
  public get subscription(): string | null {
    return this._subscription;
  }
  public set subscription(value: string | null) {
    this._subscription = value;
  }
  public get version(): number {
    return this._version;
  }
  public set version(value: number) {
    this._version = value;
  }
  public get accountId(): string | null {
    return this._accountId;
  }
  public set accountId(value: string | null) {
    this._accountId = value;
  }
  public get cosmosAddress(): HaqqCosmosAddress {
    return this._cosmosAddress;
  }
  public set cosmosAddress(value: HaqqCosmosAddress) {
    this._cosmosAddress = value;
  }
  public get position(): number {
    return this._position;
  }
  public set position(value: number) {
    this._position = value;
  }
  public get isImported(): boolean | undefined {
    return this._isImported;
  }
  public set isImported(value: boolean | undefined) {
    this._isImported = value;
  }
}
