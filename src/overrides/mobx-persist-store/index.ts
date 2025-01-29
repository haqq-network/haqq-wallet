import * as MobxPersist from 'mobx-persist-store';

export * from 'mobx-persist-store';

export const isHydrated: typeof MobxPersist.isHydrated = IS_DETOX
  ? () => true
  : MobxPersist.isHydrated;

export const makePersistable: typeof MobxPersist.makePersistable = IS_DETOX
  ? () => Promise.resolve({} as any)
  : MobxPersist.makePersistable;
