import jsonServerProvider from 'ra-data-json-server';
import { fetchUtils } from 'react-admin';
import { stringify } from 'query-string';

export default (apiUrl, httpClient = fetchUtils.fetchJson) => {
  const dataProvider = jsonServerProvider(apiUrl, httpClient);

  return {
    ...dataProvider,
    getList: (...args) => {
      return dataProvider.getList(...args).then(results => {
        if (args[0] === 'modified-files') {
          results.data = results.data.map(row => ({ ...row, id: row.filepath }));
        }
        console.log(args, results);
        return results;
      });
    },
    updateMany: (resource, params) => {
      console.log(params);
      // encodeURIComponent
      if (resource === 'modified-files') {
        params.ids = params.ids.map(id => encodeURIComponent(id));
        return httpClient(`${apiUrl}/${resource}`, {
          method: 'PUT',
          body: JSON.stringify(params),
        }).then(({ json }) => ({ data: json }));
      }
      return dataProvider.updateMany(resource, params);
    }
  };
};
