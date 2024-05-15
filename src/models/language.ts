import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {setLanguage, supportedTranslationsMap} from '@app/i18n';
import {Backend} from '@app/services/backend';
import {storage} from '@app/services/mmkv';
import {AppLanguage, Language as LanguageType} from '@app/types';

class LanguageStore {
  current: AppLanguage = AppLanguage.en;
  keys: Object = supportedTranslationsMap[this.current];
  //@ts-ignore
  hash: string = supportedTranslationsMap[this.current]._hash;

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        //@ts-ignore
        properties: ['current', 'keys', 'hash'],
        storage: storage,
      });
    }
  }

  init = async () => {
    setLanguage(this.current, this.keys);
    await this.verify();
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

const instance = new LanguageStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Language};
