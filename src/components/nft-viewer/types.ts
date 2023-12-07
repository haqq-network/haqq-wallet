import {NftCollection, NftItem} from '@app/types';

export interface NftSection extends Omit<NftCollection, 'data'> {
  data: NftSectionData[];
}

export interface NftSectionData {
  data: NftItem[];
}
