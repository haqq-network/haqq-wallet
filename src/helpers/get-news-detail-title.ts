import {RouteProp} from '@react-navigation/core/lib/typescript/src/types';
import {StackNavigationOptions} from '@react-navigation/stack';

import {PopupHeader} from '@app/components';
import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {SpacerPopupButton} from '@app/components/popup/spacer-popup-button';
import {News} from '@app/models/news';
import {RootStackParamList, StackPresentationTypes} from '@app/types';

export function getNewsDetailTitle(props: {
  route: RouteProp<RootStackParamList, 'newsDetail'>;
  navigation: any;
}): StackNavigationOptions {
  const news = News.getById(props.route.params.id);

  return {
    title: news?.title || '',
    headerShown: true,
    header: PopupHeader,
    headerLeft: SpacerPopupButton,
    headerRight: DismissPopupButton,
    presentation: 'modal' as StackPresentationTypes,
  };
}
