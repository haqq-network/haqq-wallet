import * as MobxPersist from 'mobx-persist-store';

export * from 'mobx-persist-store';

export const isHydrated: typeof MobxPersist.isHydrated = IS_JEST
  ? () => true
  : MobxPersist.isHydrated;

export const makePersistable: typeof MobxPersist.makePersistable = IS_JEST
  ? () => Promise.resolve({} as any)
  : MobxPersist.makePersistable;
