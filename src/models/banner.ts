import {makeAutoObservable} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {Color} from '@app/colors';
import {storage} from '@app/services/mmkv';

import UUID = Realm.BSON.UUID;

export enum BannerButtonEvent {
  claimCode = 'claimCode',
  close = 'close',
  notificationNews = 'notificationNews',
  notificationsEnable = 'notificationsEnable',
  notificationsSnooze = 'notificationsSnooze',
  notificationsTopicSubscribe = 'notificationsTopicSubscribe',
  notificationsTopicSnooze = 'notificationsTopicSnooze',
  trackActivityClick = 'trackActivityClick',
  trackActivityClose = 'trackActivityClose',
  test = 'test',
  empty = '',
}

export enum BannerType {
  claimCode = 'claimCode',
  notifications = 'notifications',
  notificationsTopic = 'notificationsTopic',
  trackActivity = 'trackActivity',
  test = 'test',
}

export type BannerButton = {
  id: UUID;
  title: string;
  event: BannerButtonEvent;
  params: object;
  color: string;
  backgroundColor: string;
};

export type Banner = {
  id: string;
  type: BannerType;
  title: string;
  description?: string;
  buttons?: BannerButton[];
  titleColor?: string | Color;
  descriptionColor?: string | Color;
  backgroundColorFrom?: string;
  backgroundColorTo?: string;
  backgroundImage?: string;
  backgroundBorder?: string | Color;
  closeButtonColor?: string | Color;
  isUsed?: boolean;
  snoozedUntil?: Date;
  defaultEvent?: BannerButtonEvent;
  defaultParams?: object;
  closeEvent?: BannerButtonEvent;
  closeParams?: object;
  priority?: number;
};

class BannerStore {
  banners: Banner[] = [];

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        properties: ['banners'],
        storage: storage,
      });
    }
  }

  create(params: Banner) {
    const existingBanner = this.getById(params.id);
    const buttons = existingBanner ? existingBanner.buttons : [];
    const newBanner = {
      ...existingBanner,
      ...params,
      buttons: params.buttons || buttons,
    };

    if (existingBanner) {
      this.update(existingBanner.id, params);
    } else {
      this.banners.push(newBanner);
    }

    return params.id;
  }

  remove(id: string | undefined) {
    if (!id) {
      return false;
    }
    const bannerToRemove = this.getById(id);
    if (!bannerToRemove) {
      return false;
    }
    this.banners = this.banners.filter(
      banner => banner.id !== bannerToRemove.id,
    );
    return true;
  }

  removeAll() {
    this.banners = [];
  }

  getAll() {
    return this.banners;
  }

  getAvailable() {
    return this.banners
      .filter(banner => !banner.isUsed)
      .sort(banner => banner.priority || 0);
  }

  getById(id: string) {
    return this.banners.find(banner => banner.id === id);
  }

  update(id: string | undefined, params: Omit<Partial<Banner>, 'id'>) {
    if (!id) {
      return false;
    }
    const bannerToUpdate = this.getById(id);
    if (!bannerToUpdate) {
      return false;
    }
    const bannersWithoutOldValue = this.banners.filter(
      banner => banner.id !== bannerToUpdate.id,
    );
    this.banners = [...bannersWithoutOldValue, {...bannerToUpdate, ...params}];
    return true;
  }
}

const instance = new BannerStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Banner};
