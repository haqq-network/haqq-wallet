import {useCallback, useEffect, useMemo, useState} from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

import {First, Icon} from '../ui';

export function ValidatorAvatar({identity}: {identity?: string}) {
  const [isError, setError] = useState(false);

  // TODO: add caching
  // note: when use realm to cache got error: [Error: Exception in HostFunction: The Realm is already in a write transaction]
  // note: when use MMKV to cache got warn:  Excessive number of pending callbacks: 501. Some pending callbacks that might have leaked by never being called from native code: {"8344":{"module":"FileReaderModule","method":"readAsText"},"8345":{"module":"FileReaderModule","method":"readAsText"},"8346":{"module":"FileReaderModule","method":"readAsText"},"8347":{"module":"FileReaderModule","method":"readAsText"},"8348":{"module":"FileReaderModule","method":"readAsText"},"8349":{"module":"FileReaderModule","method":"readAsText"},"8350":{"module":"FileReaderModule","method":"readAsText"},"8351":{"module":"FileReaderModule","method":"readAsText"},"8353":{"module":"FileReaderModule","method":"readAsText"},"8356":{"module":"FileReaderModule","method":"readAsText"},"8358":{"module":"FileReaderModule","method":"readAsText"},"8359":{"module":"FileReaderModule","method":"readAsText"},"8360":{"module":"FileReaderModule","method":"readAsText"},"8361":{"module":"FileReaderModule","method":"readAsText"},"8718":{},"8719":{},"8720":{},"8721":{},"8722":{},"8723":{},"8724":{},"8725":{},"8726":{},"8727":{},"8728":{},"8729":{},"8730":{},"8731":{},"8732":{},"8733":{},"8734":{},"8735":{},"8736":{},"8740":{},"8741":{},"8742":{},"8743":{},"8744":{},"8748":{},"8749":{},"8750":{},"8751":{},"8752":{},"8753":{},"8754":{},"8755":{},"8756":{},"8757":{},"8758":{},"8759":{},"...(truncated keys)...":451}
  const [avatarsCache, setAvatarsCache] = useState<Record<string, string>>({});

  const handleLoadError = useCallback(() => setError(true), []);

  const getAvatarFromKeybase = useCallback(async (id: string) => {
    return await fetch(
      `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${id}&fields=pictures`,
    ).then(r => r.json());
  }, []);

  useEffect(() => {
    (async () => {
      if (identity) {
        if (!avatarsCache?.[identity]) {
          const keyBaseData = await getAvatarFromKeybase(identity);
          if (Array.isArray(keyBaseData.them) && keyBaseData.them.length > 0) {
            const uri = String(
              keyBaseData.them[0]?.pictures?.primary?.url,
            ).replace(
              'https://s3.amazonaws.com/keybase_processed_uploads/',
              '',
            );

            if (uri) {
              setAvatarsCache({
                ...avatarsCache,
                [identity]: uri,
              });
            }
          }
        }
      }
    })();
  }, [getAvatarFromKeybase, identity, avatarsCache]);

  const logo = useMemo(() => {
    if (identity) {
      const url = avatarsCache?.[identity];

      if (!url) {
        return undefined;
      }

      return url.startsWith('http')
        ? url
        : `https://s3.amazonaws.com/keybase_processed_uploads/${url}`;
    }

    return undefined;
  }, [identity, avatarsCache]);

  const showImage = !!logo && !isError;

  return (
    <View style={styles.iconWrapper}>
      <First>
        {showImage && (
          <Image
            source={{uri: logo}}
            style={styles.iconWrapper}
            onError={handleLoadError}
          />
        )}
        <Icon i24 name="servers" color={Color.graphicBase1} />
      </First>
    </View>
  );
}

const styles = createTheme({
  iconWrapper: {
    width: 42,
    height: 42,
    backgroundColor: Color.bg3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
