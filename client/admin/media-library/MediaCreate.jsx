import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  ImageInput,
} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import RichTextInput from 'ra-input-rich-text';
import FilePreviewField from '../components/FilePreviewField';

export const styles = {
  price: { width: '7em' },
  width: { width: '7em' },
  height: { width: '7em' },
  stock: { width: '7em' },
  widthFormGroup: { display: 'inline-block' },
  heightFormGroup: { display: 'inline-block', marginLeft: 32 },
};

const useStyles = makeStyles(styles);

const MediaCreate = props => {
  const classes = useStyles();
  return (
    <Create {...props}>
      <SimpleForm>
        <ImageInput source="file" label="Related pictures">
          <FilePreviewField source="src" title="title" />
        </ImageInput>
        <TextInput source="title" label="" />
        <RichTextInput source="description" label="" />
      </SimpleForm>
    </Create>
  );
};

export default MediaCreate;
