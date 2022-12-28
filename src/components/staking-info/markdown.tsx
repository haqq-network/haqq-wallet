import React, {ReactNode} from 'react';

import {StyleSheet} from 'react-native';
import RNMarkdown, {ASTNode} from 'react-native-markdown-display';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {WINDOW_WIDTH} from '@app/variables/common';

const rules = {
  paragraph: (node: ASTNode, children: ReactNode[]) => {
    return (
      <Text key={node.key} t14 color={Color.textBase2}>
        {children}
      </Text>
    );
  },
};

export type MarkdownProps = {
  children: ReactNode;
};

export const Markdown = ({children}: MarkdownProps) => {
  return (
    <RNMarkdown style={styles} rules={rules}>
      {children}
    </RNMarkdown>
  );
};

const styles = StyleSheet.create({
  body: {
    width: WINDOW_WIDTH - 40,
  },
});
