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
  FormDataConsumer,
} from 'react-admin';
import BookIcon from '@material-ui/icons/Book';
import { ContentTypeList } from './ContentTypeList';
import {ImageInputConfig} from '../components/ImageInput';
import get from 'lodash/get';
const ContentTypeTitle = ({ record }) => {
  return <span>Content Type {record ? `"${record.type}"` : ''}</span>;
};
const getFieldConfig = (fieldType, source) => {
  switch (fieldType) {
    case 'ImageInput':
      return <ImageInputConfig source={source}/>;
    default:
      return <></>;
  }
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
              { id: 'TextInput', name: 'Text' },
              { id: 'RichTextInput', name: 'Rich Text' },
              { id: 'ImageInput', name: 'Image' },
            ]}
          />
          {getFieldConfig()}
          <FormDataConsumer>
            {(props) => {
              console.log('FormDataConsumer=', props);
              console.log('props.getSource()=', props.getSource());
              return getFieldConfig(
                get(props, `formData.${props.id}.fieldType`),
                props.id
              );
            }}
          </FormDataConsumer>
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
