import React, {memo, useCallback, useMemo, useReducer, useState} from 'react';

import {Alert, View} from 'react-native';
import {validate} from 'validate.js';

import {Color} from '@app/colors';
import {ActionsSheet} from '@app/components/actions-sheet';
import {WrappedInput} from '@app/components/settings-provider-edit/wrapped-input';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';

import {
  Button,
  ButtonVariant,
  CustomHeader,
  IconsName,
  KeyboardSafeArea,
  Spacer,
} from '../ui';

export type SettingsProviderEditData = Omit<
  Partial<Provider>,
  'ethChainId' | 'id'
> & {
  isChanged: boolean;
  ethChainId?: string;
};

export type SettingsProviderEditProps = {
  provider: Provider | null;
  buttonType?: 'save' | 'del';
  onSubmit: (provider: Partial<Provider>) => void;
  onDelete: () => void;
  onCancel: () => void;
  onSelect: () => void;
};

function reducer(
  state: SettingsProviderEditData,
  action: {type: string; key: string; value: string},
) {
  switch (action.type) {
    case 'update':
      return {...state, isChanged: true, [action.key]: action.value};
    default:
      throw new Error();
  }
}

const constraints = {
  name: {
    presence: {allowEmpty: false},
  },
  ethRpcEndpoint: {
    presence: {allowEmpty: false},
    url: true,
  },
  ethChainId: {
    presence: {allowEmpty: false},
    numericality: true,
  },
  cosmosRestEndpoint: {
    presence: {allowEmpty: false},
    url: true,
  },
  cosmosChainId: {
    presence: {allowEmpty: false},
  },
  explorer: {
    url: true,
  },
};

export const SettingsProviderEdit = memo(
  ({
    provider,
    onSubmit,
    onDelete,
    onCancel,
    onSelect,
  }: SettingsProviderEditProps) => {
    const [actionSheetVisible, setActionSheetVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(!provider);
    const [state, dispatch] = useReducer(reducer, {
      isChanged: false,
      ...(provider
        ? {...provider?.toJSON(), ethChainId: String(provider?.ethChainId)}
        : {}),
    });

    const error = useMemo(() => validate(state, constraints), [state]);

    const onChangeField = useCallback((key: string, value: string) => {
      dispatch({type: 'update', key, value});
    }, []);

    const onPressKeepEditing = () => setActionSheetVisible(false);

    const onPressDiscard = () => {
      setActionSheetVisible(false);
      onCancel();
    };

    const onRemove = () => {
      Alert.alert(
        'Delete Contact',
        'Are you sure you want to delete the selected contact?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: onDelete,
          },
        ],
      );
    };

    const right = useMemo(() => {
      if (isEdit) {
        return {
          textRight: getText(I18N.save),
          disabledRight: !(state.isChanged && !error),
          onPressRight: () =>
            onSubmit({
              name: state.name,
              ethRpcEndpoint: state.ethRpcEndpoint,
              ethChainId: parseInt(state.ethChainId!, 10),
              cosmosRestEndpoint: state.cosmosRestEndpoint,
              cosmosChainId: state.cosmosChainId,
              explorer: state.explorer,
            }),
          textColorRight: Color.graphicGreen1,
        };
      }

      if (!provider?.isEditable) {
        return {};
      }

      return {
        textRight: getText(I18N.edit),
        onPressRight: () => setIsEdit(true),
        textColorRight: Color.graphicGreen1,
      };
    }, [error, isEdit, onSubmit, provider, state]);

    const left = useMemo(() => {
      if (isEdit) {
        return {
          onPressLeft: () => {
            if (state.isChanged) {
              setActionSheetVisible(true);
            } else {
              onCancel();
            }
          },
          textLeft: getText(I18N.cancel),
          textColorLeft: Color.graphicGreen1,
        };
      }

      return {
        onPressLeft: onCancel,
        iconLeft: IconsName.arrow_back,
        textColorLeft: Color.graphicGreen1,
      };
    }, [onCancel, state, isEdit]);

    return (
      <>
        <CustomHeader
          title={getText(I18N.settingsContactEditHeaderTitle)}
          {...left}
          {...right}
        />
        <KeyboardSafeArea style={page.container}>
          <WrappedInput
            label={I18N.settingsProviderEditName}
            isEditable={isEdit ?? false}
            value={state.name}
            name="name"
            onChange={onChangeField}
          />
          <Spacer height={24} />
          <WrappedInput
            label={I18N.settingsProviderEditEthEndpoint}
            isEditable={isEdit ?? false}
            value={state.ethRpcEndpoint}
            name="ethRpcEndpoint"
            onChange={onChangeField}
          />
          <Spacer height={24} />
          <WrappedInput
            label={I18N.settingsProviderEditEthChainId}
            isEditable={isEdit ?? false}
            value={state.ethChainId}
            name="ethChainId"
            onChange={onChangeField}
          />
          <Spacer height={24} />
          <WrappedInput
            label={I18N.settingsProviderEditExplorer}
            isEditable={isEdit ?? false}
            value={state.explorer}
            name="explorer"
            onChange={onChangeField}
          />
          <Spacer height={24} />
          <WrappedInput
            label={I18N.settingsProviderEditCosmosEndpoint}
            isEditable={isEdit ?? false}
            value={state.cosmosRestEndpoint}
            name="cosmosRestEndpoint"
            onChange={onChangeField}
          />
          <Spacer height={24} />
          <WrappedInput
            label={I18N.settingsProviderEditCosmosChainId}
            isEditable={isEdit ?? false}
            value={state.cosmosChainId}
            name="cosmosChainId"
            onChange={onChangeField}
          />

          {isEdit && provider && (
            <View style={page.buttonContainerRemove}>
              <Button
                variant={ButtonVariant.error}
                style={page.errorButton}
                onPress={onRemove}
                title={getText(I18N.settingsProviderEditDeleteProvider)}
              />
            </View>
          )}
          {!isEdit && provider && (
            <>
              <Spacer />
              <Button
                variant={ButtonVariant.second}
                i18n={I18N.settingsProviderEditUseProvider}
                onPress={onSelect}
              />
            </>
          )}
        </KeyboardSafeArea>
        {actionSheetVisible && (
          <ActionsSheet
            onPressKeepEditing={onPressKeepEditing}
            onPressDiscard={onPressDiscard}
          />
        )}
      </>
    );
  },
);

const page = createTheme({
  container: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 12,
  },
  spaceInput: {height: 24},
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  buttonContainerRemove: {
    alignSelf: 'flex-start',
    marginTop: 24,
  },
  errorButton: {
    backgroundColor: Color.bg7,
    borderRadius: 12,
  },
});
