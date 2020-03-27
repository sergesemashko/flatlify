import React from 'react';
import PropTypes from 'prop-types';
import {
  BooleanInput,
  required,
  TextInput,
  NumberInput,
  ImageInput,
  ImageField
} from 'react-admin';

export const ImageInputConfig = ({source}) => {
  return <>
    <TextInput source={`${source}.accept`} require={required()} label="Accept. MIME type" initialValue="image/*" />
    <BooleanInput label="Mutliple" source={`${source}.multiple`}/>
    <TextInput source={`${source}.placeholder`} label="Placeholder Text" />
    <NumberInput source={`${source}.minSize`} label="Min. Size (MB)"/>
    <NumberInput source={`${source}.maxSize`} label="Max. Size (MB)"/>
  </>;
};
const _ImageInput = (props) => {
  console.log(props);
  return <ImageInput {...props}>
    <ImageField source="src" title="title" />
  </ImageInput>;
};

_ImageInput.propTypes = {
  basePath: PropTypes.string,
  label: PropTypes.string,
  resource: PropTypes.string.isRequired,
};

export default _ImageInput;
