import React from 'react';
import {Button, Container} from '../components/ui';
import {testDecrypt, testEncrypt} from '../passworder.ios';

export const SettingsTestScreen = () => {
  return (
    <Container>
      <Button
        title="Test"
        onPress={() => {
          testEncrypt('123', '456')
            .then(resp => {
              console.log('enc', resp);
              return testDecrypt('123', resp);
            })
            .then(resp => {
              console.log('dec', resp);
            });
        }}
      />

      <Button
        title="Test 2"
        onPress={() => {
          testDecrypt(
            '111',
            '{"cipher":"VBUdKSVs5ijlLQ5io2VqxCQjAT6lGqIdd40cT3uhYqH1rmYmLcxPO2vk161qLr4lSwYtj8MWAUFSpKFzLa87Vzh43xgPRCgYoO6XoTxnjkzKXVsY7LhQW5seQ6DWLqrXUOT6a0uycHFcjbX9NBB6SQ54/iRQ7eyOCCWLD//vJy4OkCfFSLblccHPwxCqm29x4O40aW/GQo7YVN7sfcV48w3v1fiju8aGm4OD9N40NA7ZPZvbUlAe9whPEkg02HrwwntC2FXS5Pd8M0oaGL4KnBzz3e1LKJRldQNN2JF/Z00=","iv":"1a1c90a0055694cdf040a62f40541df4","salt":"ouP4Uxle76R7p9rXFX2TyA=="}',
          ).then(resp => {
            console.log('dec', resp);
          });
        }}
      />
    </Container>
  );
};
