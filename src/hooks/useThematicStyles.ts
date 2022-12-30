import {createTheme} from '@app/helpers';
import {useTheme} from '@app/hooks/useTheme';
import {NamedStyles} from '@app/types';

export const useThematicStyles = <T extends {}>(
  stylesObj: T | NamedStyles<T>,
) => {
  const {colors} = useTheme();
  const styles = createTheme(stylesObj, colors);
  return styles;
};
