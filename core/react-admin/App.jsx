import React, { useEffect, useState } from 'react'
import { Admin, Resource, ListGuesser } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';
import authProvider from './authProvider';
import contentTypesActions from './content-types'
import modifiedFilesActions from './modified-files'

const dataProvider = jsonServerProvider('http://localhost:3000');
const App = () => {
  const [contentTypes, setContentTypes] = useState([])
  const [ready, setReady] = useState(false)
  useEffect(() => {
    dataProvider.getList('content-types', {
      pagination: { page: 1, perPage: 25 },
      sort: { field: 'title', order: 'ASC' },
    }).then(contentTypes => {
      console.log(contentTypes)
      setContentTypes(contentTypes.data)
      setReady(true)
    }).catch(e => console.error(e))

    return () => {}
  }, [])
  const contentTypeResources = contentTypes.map(contentType =>
    <Resource
      key={`type-${contentType.type}`}
      name={`${String(contentType.type).toLowerCase()}s`}
      {...contentTypesActions}
    />,
  )
  return <Admin dataProvider={dataProvider} authProvider={authProvider}>
    {permissions => [
      <Resource name="content-types" {...contentTypesActions} />,
      <Resource name="modified-files" {...modifiedFilesActions} />,
      ...contentTypeResources,
    ]}
  </Admin>;
};

export default App;
