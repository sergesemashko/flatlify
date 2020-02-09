import React from 'react'
import {
  ArrayInput,
  BooleanInput,
  Create,
  Edit,
  required,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  RichTextField,
  TextInput,
} from 'react-admin'
import S from 'string';
import { Datagrid, List, TextField, PostListActionToolbar, EditButton } from 'ra-ui-materialui'

const ContentTypeTitle = ({ record }) => {
  return <span>Content Type {record ? `"${record.type}"` : ''}</span>
}

const getFieldComponent = (type) => {
  switch (type) {
    case "RichTextInput":
      return RichTextField;
    case "TextInput":
      return TextInput;
  }

}

const createCRUDComponents = (contentTypeSettings) => {
  const Fields = () => {
    return <>
      <TextInput source="type"  validate={required()} />
      {contentTypeSettings.fields.map(fieldConfig => {
        const FieldComponent = getFieldComponent(fieldConfig.fieldType);
        return <FieldComponent label={fieldConfig.title} source={S(fieldConfig.title).slugify().camelize().s} />;
      })}
    </>;
  }
  const ContentTypeCreate = (props) => (
    <Create title="Create a ContentType" {...props}>
      <SimpleForm>
        <Fields />
      </SimpleForm>
    </Create>
  );
  const ContentTypeEdit = (props) => (
    <Edit title={<ContentTypeTitle/>} {...props}>
      <SimpleForm>
        <TextInput disabled source="id"/>
        <Fields />
      </SimpleForm>
    </Edit>
  );

  const GenericTypeList = (props) => (
    <List
      {...props}
    >
      <Datagrid>
        <TextField source="id"/>
        <TextField source="type"/>
        <EditButton />
      </Datagrid>
    </List>
  )
  return {
    list: GenericTypeList,
    create: ContentTypeCreate,
    edit: ContentTypeEdit,
    show: ContentTypeEdit,
    icon: contentTypeSettings.icon,
  }
}

export default createCRUDComponents;
