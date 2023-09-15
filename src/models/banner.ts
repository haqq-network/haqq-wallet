import {makeAutoObservable} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {Color} from '@app/colors';

import UUID = Realm.BSON.UUID;

export type BannerButton = {
  id: UUID;
  title: string;
  event:
    | 'claimCode'
    | 'close'
    | 'notificationsTurnOn'
    | 'notificationsTopicSubscribe';
  params: object;
  color: string;
  backgroundColor: string;
};

export type Banner = {
  id: string;
  type: 'claimCode' | 'notifications' | 'notificationsTopic' | 'trackActivity';
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
  defaultEvent?: string;
  defaultParams?: object;
  closeEvent?: string;
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
      this.update(existingBanner.id, existingBanner);
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
