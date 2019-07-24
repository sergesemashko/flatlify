import React from 'react';
import Router from 'next/router';
import { create } from '../../../core/client/api/content';
import { getContentTypeMeta } from '../../../core/entities/content-type';
import ContentTypeForm from '../../../core/ui/ContentTypeForm';

const Create = ({ typeSchema, contentType }) => (
  <ContentTypeForm
    typeSchema={typeSchema}
    initialValues={{ slug: '', data: '', multidata: '' }}
    onSave={values => {
      values.slug = values.slug.trim();
      create(contentType, values.slug, { type: contentType, ...values }).then(
        res => {
          Router.push('/admin/content/list?contentType=' + contentType);
        },
        err => {
          console.error(err);
        },
      );
    }}
  />
);

Create.getInitialProps = async ({ query }) => {
  const typeSchema = await getContentTypeMeta(query.contentType);
  const contentType = query.contentType;
  return { typeSchema, contentType };
};

export default Create;
