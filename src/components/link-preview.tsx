import React from 'react';

import {Link} from '@app/types';

import {LinkPreviewLine} from './link-preview-line';
import {LinkPreviewSquare} from './link-preview-square';

export enum LinkPreviewVariant {
  square,
  line,
}

export interface LinkPreviewProps {
  link: Link;
  hideArrow?: boolean;
  disabled?: boolean;
  variant?: LinkPreviewVariant;

  onPress?(link: Link): void;
}

export const LinkPreview = (props: LinkPreviewProps) => {
  switch (props?.variant) {
    case LinkPreviewVariant.line: {
      return <LinkPreviewLine {...props} />;
    }
    case LinkPreviewVariant.square:
    default: {
      return <LinkPreviewSquare {...props} />;
    }
  }
};
