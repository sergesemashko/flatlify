import React from 'react';
import {
  SingleFieldList,
  ArrayInput,
  ChipField,
  ReferenceField,
  ReferenceArrayField,
  BooleanInput,
  Create,
  Edit,
  required,
  SimpleForm,
  TextInput,
} from 'react-admin';
import S from 'string';
import { Datagrid, List, TextField, PostListActionToolbar, EditButton } from 'ra-ui-materialui';
import RichTextInput from 'ra-input-rich-text';
import ImageInput from '../components/ImageInput';
import { _ReferenceInput, _ReferenceArrayInput } from '../components/ReferenceInput';
import { contentTypesSelector } from '../../selectors/adminSelectors';
import { useSelector } from 'react-redux';

const getFieldComponent = type => {
  switch (type) {
    case 'RichTextInput':
      return RichTextInput;
    case 'TextInput':
      return TextInput;
    case 'ImageInput':
      return ImageInput;
    case 'ReferenceInput':
      return _ReferenceInput;
    case 'ReferenceArrayInput':
      return _ReferenceArrayInput;
    default:
      return <></>;
  }
};

const createCRUDComponents = contentTypeSettings => {
  const ContentTypeTitle = () => {
    return <span>{S(contentTypeSettings.type).titleCase().s}</span>;
  };
  const Fields = () => {
    return (
      <>
        {contentTypeSettings.fields.map(({ isRequired, title, fieldType, ...fieldConfig }, i) => {
          const FieldComponent = getFieldComponent(fieldType);
          return (
            <FieldComponent
              key={i}
              label={title}
              source={
                S(title)
                  .slugify()
                  .camelize().s
              }
              validate={isRequired ? required() : undefined}
              {...fieldConfig}
            />
          );
        })}
      </>
    );
  };

  const ContentTypeCreate = props => (
    <Create title="Create a ContentType" {...props}>
      <SimpleForm>
        <Fields />
      </SimpleForm>
    </Create>
  );
  const ContentTypeEdit = props => {
    return (
      <Edit title={<ContentTypeTitle />} {...props}>
        <SimpleForm>
          <TextInput disabled source="id" />
          <Fields />
        </SimpleForm>
      </Edit>
    );
  };

  const GenericTypeList = props => {
    const contentTypes = useSelector(contentTypesSelector);
    return (
      <List {...props}>
        <Datagrid>
          <TextField source="id" />
          {contentTypeSettings.fields
            .filter(fieldConfig => !!fieldConfig._gridDisplay_)
            .map(fieldConfig => {
              const Field = getField(fieldConfig, contentTypes);

              return Field;
            })}
          <EditButton />
        </Datagrid>
      </List>
    );
  };

  function getField(fieldConfig, contentTypes) {
    const source = S(fieldConfig.title)
      .slugify()
      .camelize().s;

    switch (fieldConfig.fieldType) {
      case 'ReferenceInput': {
        const type = getType(contentTypes, fieldConfig.refTypeId);

        return (
          <ReferenceField label={fieldConfig.displayValue} source={source} reference={type}>
            <TextField source={fieldConfig.displayValue} />
          </ReferenceField>
        );
      }
      case 'ReferenceArrayInput': {
        const type = getType(contentTypes, fieldConfig.refTypeId);

        return (
          <ReferenceArrayField label={fieldConfig.displayValue} source={source} reference={type}>
            <SingleFieldList>
              <ChipField source={fieldConfig.displayValue} />
            </SingleFieldList>
          </ReferenceArrayField>
        );
      }
      default:
        return <TextField source={source} />;
    }
  }

  function getType(contentTypes, searchTypeId) {
    const contentType = contentTypes.find(contentType => contentType.id === searchTypeId);
    const type = contentType.type.toLowerCase();
    return type;
  }

  return {
    list: GenericTypeList,
    create: ContentTypeCreate,
    edit: ContentTypeEdit,
    show: ContentTypeEdit,
    icon: contentTypeSettings.icon,
  };
};

export default createCRUDComponents;
