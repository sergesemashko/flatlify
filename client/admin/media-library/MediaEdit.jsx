import React from 'react';
import {
  Edit,
  FormTab,
  NumberInput,
  ReferenceInput,
  SelectInput,
  TabbedForm,
  TextInput,
} from 'react-admin';
import { InputAdornment } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RichTextInput from 'ra-input-rich-text';

import Media from './Media';
import { styles as createStyles } from './MediaCreate';

const MediaTitle = ({ record }) => <span>Poster #{record.reference}</span>;

const styles = {
  ...createStyles,
  comment: {
    maxWidth: '20em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

const useStyles = makeStyles(styles);

const MediaEdit = props => {
  const classes = useStyles();
  return (
    <Edit {...props} title={<MediaTitle />}>
      <TabbedForm>
        <FormTab label="resources.media.tabs.image">
          <Media />
          <TextInput source="image" fullWidth />
          <TextInput source="thumbnail" fullWidth />
        </FormTab>
        <FormTab label="resources.media.tabs.details" path="details">
          <TextInput source="reference" />
          <NumberInput
            source="price"
            className={classes.price}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  €
                </InputAdornment>
              ),
            }}
          />
          <NumberInput
            source="width"
            className={classes.width}
            formClassName={classes.widthFormGroup}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  cm
                </InputAdornment>
              ),
            }}
          />
          <NumberInput
            source="height"
            className={classes.height}
            formClassName={classes.heightFormGroup}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  cm
                </InputAdornment>
              ),
            }}
          />
          <NumberInput source="stock" className={classes.stock} />
        </FormTab>
        <FormTab
          label="resources.media.tabs.description"
          path="description"
        >
          <RichTextInput source="description" label="" />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

export default MediaEdit;
