import React from 'react';
import PropTypes from 'prop-types';
import { BooleanInput, required, TextInput, NumberInput, ImageInput } from 'react-admin';
import FilePreviewField from './FilePreviewField';

export const ImageInputConfig = ({ getSource }) => {
  return (
    <>
      <TextInput
        source={`${getSource('accept')}`}
        require={required()}
        label="Accept. MIME type"
        initialValue="image/*"
      />
      <BooleanInput label="Mutliple" source={getSource('multiple')}/>
      <TextInput source={`${getSource('placeholder')}`} label="Placeholder Text" />
      {/*<NumberInput source={`${source}.minSize`} label="Min. Size (MB)"/>*/}
      {/*<NumberInput source={`${source}.maxSize`} label="Max. Size (MB)"/>*/}
    </>
  );
};

const _ImageInput = props => {
  return (
    <>
      <ImageInput {...props}>
        <FilePreviewField source="src" title="title" />
      </ImageInput>
    </>
  );
};

_ImageInput.propTypes = {
  basePath: PropTypes.string,
  label: PropTypes.string,
  resource: PropTypes.string.isRequired,
};

export default _ImageInput;
