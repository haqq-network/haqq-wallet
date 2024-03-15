import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';
import {AppState, Appearance, StatusBar} from 'react-native';

// TODO Move app status into separate store
import {AppStatus, getAppStatus} from '@app/contexts';
import {storage} from '@app/services/mmkv';

import {AppTheme} from './types';

class Theme {
  _systemTheme = Appearance.getColorScheme();
  _currentTheme: AppTheme =
    (Appearance.getColorScheme() as AppTheme) ?? AppTheme.light;

  constructor() {
    makePersistable(this, {
      name: this.constructor.name,
      properties: ['_currentTheme'],
      storage: storage,
    });

    AppState.addEventListener('change', this.onChangeThemeListener);
    Appearance.addChangeListener(this.onChangeThemeListener);

    makeAutoObservable(this);
  }

  onChangeThemeListener = () => {
    const systemColorScheme = Appearance.getColorScheme();

    if (getAppStatus() === AppStatus.inactive) {
      return;
    }

    runInAction(() => {
      this._systemTheme = systemColorScheme;
    });
  };

  get currentTheme(): Omit<AppTheme, AppTheme.system> {
    return this._currentTheme === AppTheme.system
      ? this._systemTheme ?? AppTheme.light
      : this._currentTheme;
  }

  get currentSelectedTheme(): AppTheme {
    return this._currentTheme;
  }

  set currentTheme(value: AppTheme) {
    this._currentTheme = value;

    if (AppTheme.system === value) {
      StatusBar.setBarStyle(
        this._systemTheme === AppTheme.light ? 'dark-content' : 'light-content',
        false,
      );
    } else {
      StatusBar.setBarStyle(
        value === AppTheme.dark ? 'light-content' : 'dark-content',
        false,
      );
    }
  }
}

const instance = new Theme();
export {instance as Theme};
