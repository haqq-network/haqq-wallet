import {useMemo} from 'react';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {Button, ButtonProps, ButtonSize} from './button';

type ActionButtonProps = ButtonProps & {
  isActive: boolean;
  label?: I18N;
};

export const ActionButton = ({
  isActive,
  style,
  ...props
}: ActionButtonProps) => {
  const iconLeftProps = useMemo(() => {
    if (props.iconLeft) {
      return {
        iconLeft: props.iconLeft,
        iconLeftColor: isActive ? Color.textBase3 : Color.textBase1,
      };
    }

    return {};
  }, [isActive]);

  const iconRightProps = useMemo(() => {
    if (props.iconRight) {
      return {
        iconRight: props.iconRight,
        iconRightColor: isActive ? Color.textBase3 : Color.textBase1,
      };
    }

    return {};
  }, [isActive]);

  const color = useMemo(
    () => (isActive ? Color.textGreen1 : Color.bg8),
    [isActive],
  );

  const textColor = useMemo(
    () => (isActive ? Color.textBase3 : Color.textBase1),
    [isActive],
  );

  return (
    <Button
      size={ButtonSize.small}
      color={color}
      textColor={textColor}
      {...iconLeftProps}
      {...iconRightProps}
      style={[styles.button, style]}
      {...props}
    />
  );
};

const styles = createTheme({
  button: {
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 32,
  },
});
