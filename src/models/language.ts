import {makePersistable} from '@override/mobx-persist-store';
import {makeAutoObservable, runInAction} from 'mobx';
import {NativeModules, Platform} from 'react-native';

import {setLanguage, supportedTranslationsMap} from '@app/i18n';
import {Backend} from '@app/services/backend';
import {storage} from '@app/services/mmkv';
import {AppLanguage, Language as LanguageType} from '@app/types';

class LanguageStore {
  current: AppLanguage;
  keys: Object;
  hash: string;

  constructor() {
    if (!this.current) {
      // Use system language or English as default if user doesn't select another one
      let current = this.getDeviceLanguage();
      if (!supportedTranslationsMap[current]) {
        current = AppLanguage.en;
      }
      this.current = current;
    }

    if (!supportedTranslationsMap[this.current]) {
      this.current = AppLanguage.en;
    }
    this.keys = supportedTranslationsMap[this.current];
    // @ts-ignore
    this.hash = this.keys._hash;

    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      //@ts-ignore
      properties: ['current', 'hash'],
      storage,
    });
  }

  init = async () => {
    setLanguage(this.current, this.keys);
    await this.verify();
  };

  private getDeviceLanguage = (): AppLanguage => {
    return (
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
        : NativeModules.I18nManager.localeIdentifier
    ).slice(0, 2);
  };

  private verify = async () => {
    const languages = await Backend.instance.languages();
    const currentFromRemote = languages.find(item => item.id === this.current);
    if (currentFromRemote && this.hash !== currentFromRemote?.hash) {
      await this.update(currentFromRemote);
    }
  };

  private getKeys = async (language: LanguageType) => {
    if (language.hash === this.hash) {
      return supportedTranslationsMap[language.id];
    }
    const data = await Backend.instance.language(language.id);
    return data;
  };

  update = async (language: LanguageType) => {
    const keys = await this.getKeys(language);
    setLanguage(language.id, keys);
    runInAction(() => {
      this.current = language.id;
      this.keys = keys;
      this.hash = language.hash;
    });
  };
}

const instance = new LanguageStore();
export {instance as Language};
