import React from 'react';

import {StyleSheet} from 'react-native';

import {Spacer} from '@app/components/ui';
import {
  RaffleBlockList,
  RaffleBlockListProps,
} from '@app/components/ui/raffle-block-list';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {I18N, getText} from '@app/i18n';

type Props = RaffleBlockListProps;

export function RafflesWidget({
  onPress,
  data,
  scrollEnabled,
  onPressGetTicket,
  onPressShowResult,
}: Props) {
  return (
    <ShadowCard disabled style={styles.wrapper}>
      <WidgetHeader
        icon={'ticket'}
        title={getText(I18N.earnRaffles)}
        description={getText(I18N.earnRafflesDescription)}
      />
      <Spacer height={6} />
      <RaffleBlockList
        data={data}
        scrollEnabled={scrollEnabled}
        onPress={onPress}
        onPressGetTicket={onPressGetTicket}
        onPressShowResult={onPressShowResult}
      />
    </ShadowCard>
  );
}

const styles = StyleSheet.create({
  wrapper: {paddingHorizontal: 16},
});
