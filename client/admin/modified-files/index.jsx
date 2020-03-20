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
import { ModifiedFilesList } from './ModifiedFilesList';

const ContentTypeTitle = ({ record }) => {
  return <span>Content Type {record ? `"${record.type}"` : ''}</span>;
};

export const ContentTypeEdit = props => (
  <Edit title={<ContentTypeTitle />} {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput source="type" validate={required()} />
      <ArrayInput source="fields">
        <SimpleFormIterator>
          <TextInput label="Field name" source="title" />
          <SelectInput
            source="fieldType"
            choices={[
              { id: 'TextInput', name: 'TextInput' },
              { id: 'RichTextInput', name: 'RichTextInput' },
            ]}
          />
          <BooleanInput label="Is required?" source="isRequired" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

export const ContentTypeCreate = props => {
  return (
    <Create title="Create a ContentType" {...props}>
      <SimpleForm>
        <TextInput source="type" validate={required()} />
        <ArrayInput source="fields">
          <SimpleFormIterator>
            <TextInput label="Field name" source="title" />
            <SelectInput
              label="Field type"
              source="fieldType"
              translateChoice={false}
              choices={[
                { id: 'TextInput', name: 'TextInput' },
                { id: 'RichTextInput', name: 'RichTextInput' },
              ]}
            />
            <BooleanInput label="Is required?" source="isRequired" />
          </SimpleFormIterator>
        </ArrayInput>
      </SimpleForm>
    </Create>
  );
};

export default {
  list: ModifiedFilesList,
  create: ContentTypeCreate,
  edit: ContentTypeEdit,
  show: ContentTypeEdit,
  icon: BookIcon,
};
