import {makeAutoObservable, runInAction} from 'mobx';
import {isHydrated} from 'mobx-persist-store';

import {Backend} from '@app/services/backend';
import {IStory} from '@app/types';

class StoriesStore {
  private data: Record<IStory['id'], IStory> = {};
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
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
          const existingValue = prev[cur.id];
          prev[cur.id] = {...cur, seen: existingValue?.seen ?? false};
          return prev;
        },
        Object.assign({}, this.data),
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

const instance = new StoriesStore();
export {instance as Stories};
