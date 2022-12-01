import React, {useCallback} from 'react';


import {SettingsAbout} from '@app/components/settings-about';
import {openURL} from '@app/helpers';


export const SettingsAboutScreen = () => {
  // const onPressRate = useCallback(() => {
  //   const url = 'https://example.com';
  //   openURL(url);
  // }, []);

  const onPressSite = useCallback(() => {
    const url = 'https://islamiccoin.net';
    openURL(url);
  }, []);

  const onPressDoc = useCallback(() => {
    const url = 'https://islamiccoin.net';
    openURL(url);
  }, []);

  const onPressDiscord = useCallback(() => {
    const url = 'https://discord.com/invite/aZMm8pekhZ';
    openURL(url);
  }, []);

  const onPressTwitter = useCallback(() => {
    const url = 'https://twitter.com/Islamic_coin';
    openURL(url);
  }, []);

  // const onPressInstagram = useCallback(() => {
  //   const url = 'https://twitter.com/Islamic_coin';
  //   openURL(url);
  // }, []);

  return (
    <SettingsAbout
      onPressDiscord={onPressDiscord}
      onPressDoc={onPressDoc}
      onPressSite={onPressSite}
    />
  );
};

