import {RouteProp} from '@react-navigation/core/lib/typescript/src/types';
import {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import {PopupHeader} from '@app/components';
import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {GoBackPopupButton} from '@app/components/popup/go-back-popup-button';
import {SpacerPopupButton} from '@app/components/popup/spacer-popup-button';
import {News} from '@app/models/news';
import {RootStackParamList, StackPresentationTypes} from '@app/types';

export function getNewsDetailTitle(props: {
  route: RouteProp<RootStackParamList, 'newsDetail'>;
  navigation: any;
}): NativeStackNavigationOptions {
  const news = News.getById(props.route.params.id);

  return {
    title: news?.title || '',
    headerShown: true,
    header: PopupHeader,
    headerLeft: () => <GoBackPopupButton />,
    headerRight: SpacerPopupButton,
    presentation: 'modal' as StackPresentationTypes,
  };
}

export function getNewsDetailAppTitle(props: {
  route: RouteProp<RootStackParamList, 'newsDetail'>;
  navigation: any;
}): NativeStackNavigationOptions {
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
