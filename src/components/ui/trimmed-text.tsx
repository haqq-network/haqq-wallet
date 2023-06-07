import React, {useCallback, useMemo, useState} from 'react';

import {Color} from '@app/colors';
import {I18N, getText} from '@app/i18n';

import {First} from './first';
import {Text, TextProps} from './text';

export type TrimmedTextProps = Omit<TextProps, 'children'> & {
  limit: number;
  children?: string;
};

export const TrimmedText = ({
  limit = 100,
  i18n,
  i18params,
  children,
  ...props
}: TrimmedTextProps) => {
  const text: string = useMemo(
    () => (i18n && getText(i18n, i18params)) || children || '',
    [children, i18n, i18params],
  );
  const isBigText = useMemo(() => text.length > limit, [limit, text.length]);
  const [showFull, setShowFull] = useState(!isBigText);
  const trimmedText = useMemo(
    () => text.substring(0, limit).trim() + '...',
    [limit, text],
  );

  const onPressReadMore = useCallback(() => setShowFull(true), [setShowFull]);
  const onPressShowLess = useCallback(() => setShowFull(false), [setShowFull]);

  return (
    <First>
      {showFull && (
        <Text {...props}>
          {text}
          {isBigText && '\n'}
          {isBigText && (
            <Text
              {...props}
              onPress={onPressShowLess}
              i18n={I18N.trimmedTextShowLess}
              color={Color.textGreen1}
            />
          )}
        </Text>
      )}
      <Text {...props}>
        {trimmedText}
        <Text
          {...props}
          onPress={onPressReadMore}
          i18n={I18N.trimmedTextReadMore}
          color={Color.textGreen1}
        />
      </Text>
    </First>
  );
};
