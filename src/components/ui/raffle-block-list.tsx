import React, {useCallback} from 'react';

import {FlatList, ListRenderItem} from 'react-native';

import {Raffle} from '@app/types';

import {
  RaffleBlocButtonType,
  RaffleBlock,
  RaffleBlockGradientVariant,
} from './raffle-block';
import {Spacer} from './spacer';

export interface RaffleBlockListProps {
  data: Raffle[];
  scrollEnabled?: boolean;
  onPress: (raffle: Raffle) => void;
  onPressGetTicket: (raffle: Raffle) => void;
  onPressShowResult: (raffle: Raffle) => void;
}

export const RaffleBlockList = ({
  data,
  scrollEnabled,
  onPress,
  onPressGetTicket,
  onPressShowResult,
}: RaffleBlockListProps) => {
  const renderItem: ListRenderItem<Raffle> = useCallback(
    ({item, index}) => {
      const showSeparator = index !== data.length - 1;
      // TODO: add logic for gradient
      const gradient =
        item.total_tickets > 1
          ? RaffleBlockGradientVariant.green
          : RaffleBlockGradientVariant.blue;

      return (
        <>
          <RaffleBlock
            item={item}
            onPress={onPress}
            buttonType={RaffleBlocButtonType.ticket}
            gradient={gradient}
            onPressGetTicket={onPressGetTicket}
            onPressShowResult={onPressShowResult}
          />
          {showSeparator && <Spacer height={12} />}
        </>
      );
    },
    [data.length, onPress, onPressGetTicket, onPressShowResult],
  );

  const keyExtractor = useCallback((item: Raffle) => item.id, []);

  return (
    <FlatList<Raffle>
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      scrollEnabled={scrollEnabled}
      showsHorizontalScrollIndicator={false}
    />
  );
};
