import React, { useState, useEffect, useRef } from 'react';
import { DataProvider } from './dataProvider';
import contentTypesActions from './content-types';
import modifiedFilesActions from './modified-files';
import createCrudComponents from './create-crud-components';
import { contentTypesSelector } from '../selectors/adminSelectors';

import { AdminContext, AdminUI, Resource, useQueryWithStore } from 'react-admin';
import { useSelector } from 'react-redux';
const dataProvider = DataProvider('http://localhost:3020');

const App = () => (
  <AdminContext dataProvider={dataProvider}>
    <Resources />
  </AdminContext>
);

function Resources() {
  /**
   * Prefetch content-types to set dynamic resources
   */
  useQueryWithStore({
    type: 'getList',
    resource: 'content-types',
    pagination: { page: 0, perPage: 100 },
  });

  const contentTypes = useSelector(contentTypesSelector);
  const [resources, setResources] = useState([]);
  const contentTypesString = JSON.stringify(contentTypes);

  useEffect(() => {
    const resources = contentTypes.map(contentType => {
      return (
        <Resource
          key={`type-${contentType.type}`}
          name={`${String(contentType.type).toLowerCase()}`}
          {...createCrudComponents(contentType)}
        />
      );
    });
    setResources(resources);
    // do not add contentTypes in dependencies, it causes infinite rerenders if reference input is on the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentTypesString]);

  return (
    <AdminUI>
      {[
        <Resource key="content-types" name="content-types" {...contentTypesActions} />,
        ...resources,
      ]}
    </AdminUI>
  );
}

export default App;
