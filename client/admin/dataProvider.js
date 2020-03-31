const axios = require('axios').default;

const getRouteURL = (baseURL, resource) => {
  switch (resource) {
    case 'content-types':
      return `${baseURL}/content-types/content-types`;
    case 'modified-files':
      return `${baseURL}/modified-files/modified-files`;
    default:
      return `${baseURL}/content/${resource}`;
  }
};

const getFileFields = params => {
  const fileFields = {};
  for (const fieldName in params.data) {
    if (params.data.hasOwnProperty(fieldName)) {
      if (Array.isArray(params.data[fieldName])) {
        params.data[fieldName].forEach((fieldEntry, i) => {
          if (fieldEntry[i]?.rawFile instanceof File) {
            fileFields[`${fieldName}[${i}]`] = fieldEntry[i].rawFile;
          }
        });
      } else if (params.data[fieldName]?.rawFile instanceof File) {
        fileFields[fieldName] = params.data[fieldName].rawFile;
      }
    }
  }
  return fileFields;
};

const processData = params => {
  const fileFields = getFileFields(params);
  const headers = {};
  let data = params.data;
  /**
   * Convert body to multipart/form-data if there is any file field
   * @see https://stackoverflow.com/questions/43013858/how-to-post-a-file-from-a-form-with-axios
   */
  if (Object.keys(fileFields).length) {
    const formData = new FormData();
    for (const fieldName in data) {
      if (fileFields[fieldName]) {
        formData.append(fieldName, fileFields[fieldName]);
      } else {
        formData.append(fieldName, data[fieldName]);
      }
    }
    data = formData;
    headers['Content-Type'] = `multipart/form-data; boundary=${data.boundary}`;
  }

  return {
    data,
    headers,
  };
};

export const DataProvider = (baseURL = 'localhost:3020') => ({
  getList: async (resource, params) => {
    const response = await axios.get(getRouteURL(baseURL, resource), {
      params,
    });
    return response.data;
  },
  getOne: async (resource, params) => {
    const { id } = params;
    const response = await axios.get(`${getRouteURL(baseURL, resource)}/${id}`);
    return response.data;
  },
  getMany: async (resource, params) => {
    const response = await axios.get(getRouteURL(baseURL, resource), { params });
    return response.data;
  },
  getManyReference: async (resource, params) => {},
  create: async (resource, params) => {
    const { data, headers } = processData(params);
    const response = await axios.post(getRouteURL(baseURL, resource), data, { headers });
    return response;
  },
  update: async (resource, params) => {
    const id = params.id;
    const { data, headers } = processData(params);

    const response = await axios.put(`${getRouteURL(baseURL, resource)}/${id}`, data, {
      headers,
    });
    return response.data;
  },
  updateMany: async (resource, params) => {
    const response = await axios.put(getRouteURL(baseURL, resource), {
      ...params,
      author: { name: 'name', email: 'email' },
    });
    return response.data;
  },
  delete: async (resource, params) => {
    const id = params.id;
    const response = await axios.delete(`${getRouteURL(baseURL, resource)}/${id}`);
    return response.data;
  },
  deleteMany: async (resource, params) => {
    const { ids } = params;
    const response = await axios.delete(getRouteURL(baseURL, resource), {
      data: ids,
    });
    return response.data;
  },
});
