import jsonServerProvider from 'ra-data-json-server';

export default (...options) => {
  const dataProvider = jsonServerProvider(...options);

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
  };
};
