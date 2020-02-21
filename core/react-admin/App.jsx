import React, { useEffect, useState, useRef } from 'react'
import DataProvider from './dataProvider';
import authProvider from './authProvider';
import contentTypesActions from './content-types'
import modifiedFilesActions from './modified-files'
import {useSelector} from 'react-redux';
import getProp from 'lodash/get';
import createCrudComponents from './create-crud-components';

import {
  AdminContext,
  AdminUI,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
  useDataProvider,
} from 'react-admin';
const dataProvider = DataProvider('http://localhost:3000');

const App = () => (
  <AdminContext dataProvider={dataProvider}>
    <Resources />
  </AdminContext>
);

const contentTypeSelector = (state) => {
  const typesIDMap = getProp(state, ['admin','resources', 'content-types','data'], {});
  return Object.values(typesIDMap);
}

function Resources() {
  const computedContentTypes = useRef({});
  const [resources, setResources] = useState([]);

  console.log(resources);

  useEffect(() => {
    dataProvider.getList('content-types', {
      pagination: { page: 1, perPage: 25 },
      sort: { field: 'title', order: 'ASC' },
    }).then(({data: contentTypes}) => {
      console.log(contentTypes)

      if (Array.isArray(contentTypes)) {
        contentTypes.forEach(contentType => {
          if (!computedContentTypes.current[contentType.type]) {
            const resource = <Resource
              key={`type-${contentType.type}`}
              name={`${String(contentType.type).toLowerCase()}`}
              {...createCrudComponents(contentType)}
            />;
            computedContentTypes.current[contentType.type] = resource;
          }
        })
        setResources(Object.values(computedContentTypes.current));
      };
    }).catch(e => console.error(e))

    return () => {}
  }, [])

  return (
    <AdminUI>
      {[
        <Resource name="content-types" {...contentTypesActions} />,
        <Resource name="modified-files" {...modifiedFilesActions} />,
        ...resources,
      ]}
    </AdminUI>
  );
};

export default App;
