import React, {ReactNode, useRef} from 'react';

import RNMarkdown, {ASTNode, MarkdownIt} from 'react-native-markdown-display';

import {Color, getColor} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {WINDOW_WIDTH} from '@app/variables/common';

const rules = {
  paragraph: (node: ASTNode, children: ReactNode[]) => {
    return (
      <Text key={node.key} t14 color={getColor(Color.textBase2)}>
        {children}
      </Text>
    );
  },
};

export type MarkdownProps = {
  children: ReactNode;
};

export const Markdown = ({children}: MarkdownProps) => {
  const markdownIt = useRef(
    MarkdownIt({
      typographer: true,
    }),
  );

  return (
    // @ts-ignore
    <RNMarkdown style={styles} rules={rules} markdownit={markdownIt.current}>
      {children}
    </RNMarkdown>
  );
};

const styles = createTheme({
  // eslint-disable-next-line react-native/no-unused-styles
  body: {
    width: WINDOW_WIDTH - 40,
  },
});
