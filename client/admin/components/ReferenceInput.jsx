import React from 'react';

import { ReferenceInput, SelectInput, SelectArrayInput, ReferenceArrayInput } from 'react-admin';
import { contentTypesSelector } from '../../selectors/adminSelectors';
import { useSelector } from 'react-redux';
import { useForm } from 'react-final-form';
import { camelize } from '../../utils/string';

export const _ReferenceInput = props => {
  const { refTypeId, source, displayValue } = props;
  const contentTypes = useSelector(contentTypesSelector);
  const contentType = contentTypes.find(contentType => contentType.id === refTypeId);

  if (!contentType) {
    return <> </>;
  } else {
    const type = contentType.type.toLowerCase();

    return (
      <ReferenceInput reference={type} source={source}>
        <SelectInput allowEmpty optionText={camelize(displayValue)} label={contentType.type} />
      </ReferenceInput>
    );
  }
};

export const _ReferenceArrayInput = props => {
  const { refTypeId, source, displayValue } = props;
  const contentTypes = useSelector(contentTypesSelector);
  const contentType = contentTypes.find(contentType => contentType.id === refTypeId);
  if (!contentType) {
    return <> </>;
  } else {
    const type = contentType.type.toLowerCase();
    return (
      <ReferenceArrayInput reference={type} source={source}>
        <SelectArrayInput optionText={camelize(displayValue)} label={contentType.type} />
      </ReferenceArrayInput>
    );
  }
};

export const ReferenceInputConfig = props => {
  const { getSource, scopedFormData } = props;
  const contentTypes = useSelector(contentTypesSelector);
  const { refTypeId } = scopedFormData;
  const fields = contentTypes.find(contentType => contentType.id === refTypeId)?.fields || [];

  const form = useForm();
  const displayValueSource = `${getSource('displayValue')}`;

  return (
    <>
      <ReferenceInput
        reference="content-types"
        source={`${getSource('refTypeId')}`}
        label="Content Type"
        onChange={() => form.change(displayValueSource, null)}
      >
        <SelectInput optionText="type" />
      </ReferenceInput>
      <SelectInput
        choices={fields}
        optionText="title"
        optionValue="title"
        source={displayValueSource}
        label="Display value"
      />
    </>
  );
};
