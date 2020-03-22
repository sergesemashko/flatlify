import React from 'react';
import { createSelector } from 'reselect';
import { DataProvider } from './dataProvider';
import contentTypesActions from './content-types';
import modifiedFilesActions from './modified-files';
import createCrudComponents from './create-crud-components';

import { AdminContext, AdminUI, Resource } from 'react-admin';
import { useSelector } from 'react-redux';
const dataProvider = DataProvider('http://localhost:3020');

const App = () => (
  <AdminContext dataProvider={dataProvider}>
    <Resources />
  </AdminContext>
);

const contentTypesSelector = createSelector(
  [state => state.admin.resources['content-types']?.data || {}],
  resources => Object.values(resources),
);

function Resources() {
  const contentTypes = useSelector(contentTypesSelector);

  const contentTypeComponents = contentTypes.map(resource => {
    return (
      <Resource
        key={`type-${resource.type}`}
        name={`${String(resource.type).toLowerCase()}`}
        {...createCrudComponents(resource)}
      />
    );
  });
  return (
    <AdminUI>
      {[
        <Resource key="content-types" name="content-types" {...contentTypesActions} />,
        <Resource key="modified-files" name="modified-files" {...modifiedFilesActions} />,
        ...contentTypeComponents,
      ]}
    </AdminUI>
  );
}

export default App;
