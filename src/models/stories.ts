import {makeAutoObservable, runInAction} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';

import {Backend} from '@app/services/backend';
import {storage} from '@app/services/mmkv';
import {IStory} from '@app/types';

class StoriesStore {
  private data: Record<IStory['id'], IStory> = {};
  isLoading = false;

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        //@ts-ignore
        properties: ['data'],
        storage: storage,
      });
    }
  }

  fetch = async (skipLoadingFlag = false) => {
    if (!skipLoadingFlag) {
      runInAction(() => {
        this.isLoading = true;
      });
    }
    const stories = await Backend.instance.stories();
    if (Array.isArray(stories)) {
      const normalizedStories = stories.reduce(
        (prev, cur) => {
          const existingValue = this.data[cur.id];
          prev[cur.id] = {...cur, seen: existingValue?.seen ?? false};
          return prev;
        },
        {} as Record<IStory['id'], IStory>,
      );
      runInAction(() => {
        this.data = normalizedStories;
      });
    }
    runInAction(() => {
      this.isLoading = false;
    });
  };

  get stories() {
    return Object.values(this.data);
  }

  markAsSeen = (id: IStory['id']) => {
    const existingValue = this.data[id];
    if (!existingValue) {
      return;
    }
    runInAction(() => {
      this.data[id].seen = true;
    });
  };

  isHydrated = () => {
    return isHydrated(this);
  };
}

const instance = new StoriesStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Stories};
