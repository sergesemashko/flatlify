import React from 'react';
import {
  ArrayInput,
  BooleanInput,
  Create,
  Edit,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  FormDataConsumer,
} from 'react-admin';
import BookIcon from '@material-ui/icons/Book';
import { ContentTypeList } from './ContentTypeList';
import { ImageInputConfig } from '../components/ImageInput';
import { ReferenceInputConfig } from '../components/ReferenceInput';

import get from 'lodash/get';
import OrderedFormIterator from '../components/OrderedFormIterator';

const ContentTypeTitle = ({ record }) => {
  return <span>Content Type {record ? `"${record.type}"` : ''}</span>;
};
const getFieldConfig = (fieldType, getSource, scopedFormData) => {
  // React Admin warning: You're using a FormDataConsumer inside an ArrayInput and you did not called
  // the getSource function supplied by the FormDataConsumer component.
  // This is required for your inputs to get the proper source
  // but we don't need get source every time, sometimes we return empty component
  // and when we need, we call it in child components

  switch (fieldType) {
    case 'ImageInput':
      return <ImageInputConfig getSource={getSource} />;

    case 'ReferenceInput':
    case 'ReferenceArrayInput':
      return <ReferenceInputConfig getSource={getSource} scopedFormData={scopedFormData} />;

    default:
      const _source = typeof getSource === 'function' ? getSource() : null;
      return <></>;
  }
};

const Fields = props => {
  return (
    <>
      <TextInput source="type" validate={required()} />
      <SelectInput source="icon" label="icon" choices={[{ id: 'BookIcon', name: 'BookIcon' }]} />
      <ArrayInput source="fields">
        <OrderedFormIterator>
          <TextInput required label="Field name" source="title" />
          <SelectInput
            source="fieldType"
            label="Field Type"
            defaultValue="TextInput"
            choices={[
              { id: 'TextInput', name: 'Text' },
              { id: 'RichTextInput', name: 'Rich Text' },
              { id: 'ImageInput', name: 'Image' },
              { id: 'ReferenceInput', name: 'ReferenceInput' },
              { id: 'ReferenceArrayInput', name: 'ReferenceArrayInput' },
            ]}
          />
          <FormDataConsumer>
            {props => {
              return getFieldConfig(
                get(props, `formData.${props.id}.fieldType`),
                props.id,
                props.getSource,
                props.scopedFormData,
              );
            }}
          </FormDataConsumer>
          <BooleanInput label="Is required?" source="isRequired" />
          <BooleanInput label="Display in list view?" source="_gridDisplay_" />
        </OrderedFormIterator>
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
