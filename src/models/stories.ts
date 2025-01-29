import {isHydrated, makePersistable} from '@override/mobx-persist-store';
import {makeAutoObservable, runInAction} from 'mobx';
import {ImageURISource} from 'react-native';
import BlastedImage from 'react-native-blasted-image';
import convertToProxyURL from 'react-native-video-cache';

import {Backend} from '@app/services/backend';
import {storage} from '@app/services/mmkv';
import {IStory} from '@app/types';

class StoriesStore {
  private data: Record<IStory['id'], IStory> = {};
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      //@ts-ignore
      properties: ['data'],
      storage,
    });
  }

  fetch = async (skipLoadingFlag = false) => {
    if (!skipLoadingFlag) {
      runInAction(() => {
        this.isLoading = true;
      });
    }
    const stories = await Backend.instance.stories();

    const sources: ImageURISource[] = [];
    if (Array.isArray(stories)) {
      const normalizedStories = stories.reduce(
        (prev, cur) => {
          const existingValue = this.data[cur.id];
          // Cache Preview of the story
          sources.push({uri: cur.preview});
          const value = {
            ...cur,
            attachments: cur.attachments.map(item => {
              const {attachment} = item;
              if (!attachment) {
                return item;
              }
              if (attachment.type === 'image') {
                // Cache Image Content of the story
                sources.push({uri: attachment.source});
                return item;
              }
              if (attachment.type === 'video') {
                // Cache Video Content of the story
                const proxyPath = convertToProxyURL(attachment.source);
                return {
                  ...item,
                  attachment: {...item.attachment, source: proxyPath},
                };
              }
              return item;
            }),
            seen: existingValue?.seen ?? false,
          };
          prev[cur.id] = value;
          return prev;
        },
        {} as Record<IStory['id'], IStory>,
      );
      // Preload all images
      // @ts-ignore
      BlastedImage.preload(sources);
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
