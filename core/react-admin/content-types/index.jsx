import React from 'react';
import {
  ArrayInput,
  BooleanInput,
  Create,
  Edit,
  required,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
} from 'react-admin';
import BookIcon from '@material-ui/icons/Book';
import { ContentTypeList } from './ContentTypeList';

const ContentTypeTitle = ({ record }) => {
  return <span>Content Type {record ? `"${record.type}"` : ''}</span>;
};

const Fields = props => {
  return (
    <>
      <TextInput source="type" validate={required()} />
      <SelectInput source="icon" label="icon" choices={[{ id: 'BookIcon', name: 'BookIcon' }]} />
      <ArrayInput source="fields">
        <SimpleFormIterator>
          <TextInput required label="Field name" source="title" />
          <SelectInput
            source="fieldType"
            label="Field Type"
            defaultValue="TextInput"
            choices={[
              { id: 'TextInput', name: 'TextInput' },
              { id: 'RichTextInput', name: 'RichTextInput' },
            ]}
          />
          <BooleanInput label="Is required?" source="isRequired" />
          <BooleanInput label="Display in list view?" source="_gridDisplay_" />
        </SimpleFormIterator>
      </ArrayInput>
    </>
  );
};

export const ContentTypeEdit = props => {
  return (
    <Edit title={<ContentTypeTitle />} {...props}>
      <SimpleForm>
        <TextInput disabled source="id" />
        <Fields />
      </SimpleForm>
    </Edit>
  );
};

export const ContentTypeCreate = props => {
  return (
    <Create title="Create a ContentType" {...props}>
      <SimpleForm>
        <Fields />
      </SimpleForm>
    </Create>
  );
};

export default {
  list: ContentTypeList,
  create: ContentTypeCreate,
  edit: ContentTypeEdit,
  show: ContentTypeEdit,
  icon: BookIcon,
};
