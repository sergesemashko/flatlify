import React from 'react';
import PropTypes from 'prop-types';
import {
  FileField,
  ImageField,
} from 'react-admin';

const FilePreviewField = (props) => {
  const isImage = String(props?.record?.rawFile?.type || props?.record?.mimetype).startsWith('image/');
  return isImage ? <ImageField {...props} /> : <FileField {...props} />
}

FilePreviewField.propTypes = {
  label: PropTypes.string,
  record: PropTypes.object,
  source: PropTypes.string.isRequired,
};

FilePreviewField.displayName = 'FilePreviewField';
export default FilePreviewField;
