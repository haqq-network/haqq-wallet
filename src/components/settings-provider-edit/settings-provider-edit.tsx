import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import {Alert, View} from 'react-native';
import {single, validate} from 'validate.js';

import {Color} from '@app/colors';
import {ActionsSheet} from '@app/components/actions-sheet';
import {WrappedInput} from '@app/components/settings-provider-edit/wrapped-input';
import {
  Button,
  ButtonVariant,
  CustomHeader,
  IconsName,
  KeyboardSafeArea,
  Spacer,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Provider, ProviderKeys} from '@app/models/provider';

export type SettingsProviderEditData = Omit<
  Partial<Provider>,
  'ethChainId' | 'id'
> & {
  isChanged: boolean;
  ethChainId?: string;
  errors: Partial<Record<ProviderKeys, string | undefined>>;
};

export type SettingsProviderEditProps = {
  provider: Partial<Provider> | null;
  buttonType?: 'save' | 'del';
  onSubmit: (provider: Partial<Provider>) => void;
  onDelete: () => void;
  onCancel: () => void;
  onSelect: () => void;
};

type ReducerActionUpdate = {
  type: 'update';
  key: ProviderKeys;
  value: string;
};

type ReducerActionReset = {
  type: 'reset';
  data: Partial<Record<ProviderKeys, any>>;
};

type ReducerActionError = {
  type: 'error';
  key: ProviderKeys;
  value: string;
};

type ReducerAction =
  | ReducerActionUpdate
  | ReducerActionReset
  | ReducerActionError;

function reducer(state: SettingsProviderEditData, action: ReducerAction) {
  switch (action.type) {
    case 'update':
      return {
        ...state,
        isChanged: true,
        [action.key]: action.value,
        errors: {
          ...state.errors,
          [action.key]: undefined,
        },
      };
    case 'reset':
      return {isChanged: false, ...action.data, errors: {}};
    case 'error':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.key]: action.value,
        },
      };
    default:
      throw new Error();
  }
}

const constraints: Partial<Record<ProviderKeys, any>> = {
  name: {
    presence: {allowEmpty: false},
  },
  ethRpcEndpoint: {
    presence: {allowEmpty: false},
    url: true,
  },
  cosmosRestEndpoint: {
    presence: {allowEmpty: false},
    url: true,
  },
  cosmosChainId: {
    presence: {allowEmpty: false},
    format: {
      pattern: /(\w+)_(\d{1,10})-(\d{1,10})/,
      flags: 'i',
      message: 'invalid Chain ID',
    },
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
    const [isEdit, setIsEdit] = useState(!provider?.id);

    const [state, dispatch] = useReducer(reducer, {
      isChanged: false,
      errors: {},
      ...(provider
        ? {...provider, ethChainId: String(provider?.ethChainId)}
        : {}),
    } as SettingsProviderEditData);

    useEffect(() => {
      if (provider?.id) {
        setIsEdit(false);
      }
    }, [provider?.id]);

    const onChangeField = useCallback((key: ProviderKeys, value: string) => {
      dispatch({type: 'update', key, value});
    }, []);

    const onBlurField = useCallback(
      (name: ProviderKeys) => {
        if (state[name] && constraints[name]) {
          let err = single(state[name] ?? '', constraints[name] ?? {});
          if (err) {
            dispatch({
              type: 'error',
              key: name,
              value: err.join('\n'),
            });
          }
        }
      },
      [state],
    );

    const onPressKeepEditing = () => setActionSheetVisible(false);

    const onPressDiscard = () => {
      if (provider) {
        setActionSheetVisible(false);
        setIsEdit(false);
        dispatch({
          type: 'reset',
          data: {
            ...provider,
            ethChainId: String(provider?.ethChainId),
          },
        });
      } else {
        onCancel();
      }
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
          disabledRight: !state.isChanged,
          onPressRight: () => {
            const errors = validate(state, constraints) as Partial<
              Record<ProviderKeys, string[]>
            >;

            if (errors) {
              for (const [key, err] of Object.entries(errors)) {
                dispatch({
                  type: 'error',
                  key: key as ProviderKeys,
                  value: err.join('\n'),
                });
              }
              return;
            }

            const id = /(\w+)_(\d{1,10})-(\d{1,10})/.exec(
              state.cosmosChainId ?? '',
            );

            if (id) {
              onSubmit({
                name: state.name,
                ethRpcEndpoint: state.ethRpcEndpoint,
                ethChainId: parseInt(id[2], 10),
                cosmosRestEndpoint: state.cosmosRestEndpoint,
                cosmosChainId: state.cosmosChainId,
                explorer: state.explorer,
              });
              setIsEdit(false);
            }
          },
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
    }, [isEdit, onSubmit, provider, state]);

    const left = useMemo(() => {
      if (isEdit) {
        return {
          onPressLeft: () => {
            if (state.isChanged) {
              setActionSheetVisible(true);
            } else {
              if (provider) {
                setIsEdit(false);
              } else {
                onCancel();
              }
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
    }, [isEdit, onCancel, state.isChanged, provider]);

    return (
      <>
        <CustomHeader
          title={getText(I18N.settingsContactEditHeaderTitle)}
          {...left}
          {...right}
        />
        <KeyboardSafeArea style={page.container}>
          <WrappedInput
            autoFocus={true}
            label={I18N.settingsProviderEditName}
            isEditable={isEdit ?? false}
            value={state.name}
            name="name"
            placeholder={I18N.settingsProviderEditNamePlaceholder}
            error={state.errors.name}
            onChange={onChangeField}
            onBlur={onBlurField}
          />
          <Spacer height={24} />
          <WrappedInput
            label={I18N.settingsProviderEditCosmosChainId}
            isEditable={isEdit ?? false}
            value={state.cosmosChainId}
            name="cosmosChainId"
            error={state.errors.cosmosChainId}
            placeholder={I18N.settingsProviderEditCosmosChainIdPlaceholder}
            onChange={onChangeField}
            onBlur={onBlurField}
          />
          <Spacer height={24} />
          <WrappedInput
            label={I18N.settingsProviderEditCosmosEndpoint}
            isEditable={isEdit ?? false}
            value={state.cosmosRestEndpoint}
            name="cosmosRestEndpoint"
            error={state.errors.cosmosRestEndpoint}
            placeholder={I18N.settingsProviderEditCosmosEndpointPlaceholder}
            onChange={onChangeField}
            onBlur={onBlurField}
          />
          <Spacer height={24} />
          <WrappedInput
            label={I18N.settingsProviderEditEthEndpoint}
            isEditable={isEdit ?? false}
            value={state.ethRpcEndpoint}
            name="ethRpcEndpoint"
            error={state.errors.ethRpcEndpoint}
            placeholder={I18N.settingsProviderEditEthEndpointPlaceholder}
            onChange={onChangeField}
            onBlur={onBlurField}
          />
          <Spacer height={24} />
          <WrappedInput
            label={I18N.settingsProviderEditExplorer}
            isEditable={isEdit ?? false}
            value={state.explorer}
            name="explorer"
            error={state.errors.explorer}
            placeholder={I18N.settingsProviderEditExplorerPlaceholder}
            onChange={onChangeField}
            onBlur={onBlurField}
          />

          {isEdit && provider?.id && (
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
                style={page.useProviderButton}
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
  useProviderButton: {
    marginVertical: 16,
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
