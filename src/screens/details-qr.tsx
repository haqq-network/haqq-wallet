import React, {useCallback, useRef} from 'react';
import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import CameraRoll from '@react-native-community/cameraroll';

type DetailsQrScreenProp = CompositeScreenProps<any, any>;

export const DetailsQrScreen = ({route}: DetailsQrScreenProp) => {
  const svg = useRef();
  const {address} = route.params;
  const {width} = useWindowDimensions();

  const onSaveQR = useCallback(() => {
    svg.current?.toDataURL(data => {
      RNFS.writeFile(
        RNFS.CachesDirectoryPath + '/some-name.png',
        data,
        'base64',
      )
        .then(success => {
          return CameraRoll.save(
            RNFS.CachesDirectoryPath + '/some-name.png',
            'photo',
          );
        })
        .then(() => {
          console.log('saved');
        });
    });
  }, [svg]);
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <QRCode
        value={address}
        size={width - 30}
        getRef={c => (svg.current = c)}
      />

      <Button title="save qr" onPress={onSaveQR} />

      <TouchableOpacity onPress={() => Clipboard.setString(address)}>
        <Text>{address}</Text>
      </TouchableOpacity>
    </View>
  );
};
