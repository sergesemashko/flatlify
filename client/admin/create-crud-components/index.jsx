import React from 'react';
import {
  ArrayInput,
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

  const GenericTypeList = props => (
    <List {...props}>
      <Datagrid>
        <TextField source="id" />
        {contentTypeSettings.fields
          .filter(fieldConfig => !!fieldConfig._gridDisplay_)
          .map(fieldConfig => {
            return (
              <TextField
                source={
                  S(fieldConfig.title)
                    .slugify()
                    .camelize().s
                }
              />
            );
          })}
        <EditButton />
      </Datagrid>
    </List>
  );
  return {
    list: GenericTypeList,
    create: ContentTypeCreate,
    edit: ContentTypeEdit,
    show: ContentTypeEdit,
    icon: contentTypeSettings.icon,
  };
};

export default createCRUDComponents;
