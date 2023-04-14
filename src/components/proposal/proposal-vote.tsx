import React from 'react';

import {StyleSheet, useWindowDimensions} from 'react-native';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';

import {PopupProposalVote} from '@app/components/bottom-popups';
import {VoteNamesType} from '@app/types';
import {ANIMATION_DURATION, ANIMATION_TYPE} from '@app/variables/common';

export interface ProposalVoteProps {
  onVote: (vote: VoteNamesType) => void;
  onChangeVote: (vote: VoteNamesType) => void;
  modalIsVisible: boolean;
  isLoading?: boolean;
}

const timingInAnimationConfig = {
  duration: ANIMATION_DURATION,
  easing: ANIMATION_TYPE,
};

export function ProposalVote({
  isLoading,
  onVote,
  onChangeVote,
  modalIsVisible,
}: ProposalVoteProps) {
  const {height} = useWindowDimensions();

  const offset = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(
            modalIsVisible ? 0 : height / 3,
            timingInAnimationConfig,
          ),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, offset]}>
      <PopupProposalVote
        isLoading={isLoading}
        onChangeVote={onChangeVote}
        onSubmitVote={onVote}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 35,
    alignSelf: 'center',
  },
});
