import {BaseEvent, OptionalArgs} from 'events';

import {Wallet} from '@app/models/wallet';
import {ModalStateTypes} from '@app/screens/modals';

export enum Events {
  onProviderChanged = 'onProviderChanged',
  onWalletsBalanceCheck = 'onWalletsBalanceCheck',
  onWalletsBalance = 'onWalletsBalance',
  onWalletCreate = 'onWalletCreate',
  onWalletReset = 'onWalletReset',
  onWalletRemove = 'onWalletRemove',
  onWalletMnemonicCheck = 'onWalletMnemonicCheck',
  onWalletMnemonicSaved = 'onWalletMnemonicSaved',
  onPushSubscriptionAdd = 'onPushSubscriptionAdd',
  onPushSubscriptionRemove = 'onPushSubscriptionRemove',
  onDeepLink = 'onDeepLink',
  onStakingSync = 'onStakingSync',
  onCloseModal = 'onCloseModal',
  onTransactionsLoad = 'onTransactionsLoad',
  onAppStarted = 'onAppStarted',
  onAppMnemonicBackup = 'onAppMnemonicBackup',
}

// TODO: add types
export interface AppEvents extends BaseEvent {
  [Events.onProviderChanged]: [];
  [Events.onWalletsBalanceCheck]: OptionalArgs<[Function]>;
  [Events.onWalletsBalance]: [Record<string, number>];
  [Events.onWalletCreate]: [Wallet];
  [Events.onWalletReset]: [];
  [Events.onWalletRemove]: [string, Wallet, Function];
  [Events.onWalletMnemonicCheck]: [Date];
  [Events.onWalletMnemonicSaved]: [string];
  [Events.onPushSubscriptionAdd]: [];
  [Events.onPushSubscriptionRemove]: [];
  [Events.onDeepLink]: [string];
  [Events.onStakingSync]: [];
  [Events.onCloseModal]: [ModalStateTypes];
  [Events.onTransactionsLoad]: [string] | [string, Function];
  [Events.onAppStarted]: [];
  [Events.onAppMnemonicBackup]: [string];
}

export interface TransactionEvents extends BaseEvent {}
export interface UserEvents extends BaseEvent {
  providerId: [string];
}

export interface WalletsEvents extends BaseEvent {}
export interface PushNotificationsEvents extends BaseEvent {}
