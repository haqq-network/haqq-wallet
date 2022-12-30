import React, {useState} from 'react';

import {ActivityIndicator, View, useWindowDimensions} from 'react-native';

import {Color, getColor} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {VoteNamesType} from '@app/types';
import {VOTES} from '@app/variables/votes';

export type PopupProposalVoteProps = {
  onSubmitVote: (vote: VoteNamesType) => void;
  onChangeVote?: (vote: VoteNamesType) => void;
  isLoading?: boolean;
};

export const PopupProposalVote = ({
  onSubmitVote,
  onChangeVote,
  isLoading,
}: PopupProposalVoteProps) => {
  const [selected, setSelected] = useState(VOTES[0].name);
  const width = useWindowDimensions().width - 32;
  const handleChange = (vote: VoteNamesType) => {
    setSelected(vote);
    onChangeVote?.(vote);
  };

  if (isLoading) {
    return (
      <View style={[styles.sub, styles.centered, {width}]}>
        <Spacer height={25} />
        <ActivityIndicator color={getColor(Color.graphicBase2)} />
        <Spacer height={10} />
        <Text color={Color.textBase2} i18n={I18N.proposalVoteSendingVote} />
        <Spacer height={25} />
      </View>
    );
  }

  return (
    <View style={[styles.sub, {width}]}>
      <Text t7 i18n={I18N.popupProposalVoteTitle} />
      <Spacer height={2} />
      <Text
        t15
        color={Color.textBase2}
        i18n={I18N.popupProposalVoteDescription}
      />
      <Spacer height={12} />
      <View style={styles.row}>
        {VOTES.map(({name, color, i18n}, id) => {
          const isSelected = selected === name;
          const isLast = id === VOTES.length - 1;
          const bgColor = isSelected ? color : Color.transparent;

          return (
            <Button
              circleBorders
              variant={ButtonVariant.contained}
              color={bgColor}
              size={ButtonSize.small}
              style={!isLast && styles.margin}
              key={name}
              textColor={isSelected ? Color.textBase3 : Color.textBase1}
              i18n={i18n}
              onPress={() =>
                isSelected ? onSubmitVote(name) : handleChange(name)
              }
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = createTheme({
  sub: {
    backgroundColor: Color.bg1,
    flex: 0,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  margin: {marginRight: 8},
});
