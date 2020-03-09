const axios = require('axios').default;

const getRouteURL = (baseURL, resource) => {
  switch (resource) {
    case 'content-types':
      return `${baseURL}/content-types`;
    default:
      return baseURL;
  }
};

export const DataProvider = (baseURL = 'localhost:3020') => ({
  getList: async (resource, params) => {
    const response = await axios.get(`${getRouteURL(baseURL, resource)}/${resource}/list`, {
      params,
    });
    return response.data;
  },
  getOne: async (resource, params) => {
    const { id } = params;
    const response = await axios.get(`${getRouteURL(baseURL, resource)}/${resource}/${id}`);
    return response.data;
  },
  getMany: async (resource, params) => {
    const response = await axios.get(`${getRouteURL(baseURL, resource)}/${resource}`, { params });
    return response.data;
  },
  getManyReference: async (resource, params) => {},
  create: async (resource, params) => {
    console.log(params);
    const response = await axios.put(`${getRouteURL(baseURL, resource)}/${resource}`, {
      ...params,
    });
    return response;
  },
  update: async (resource, params) => {
    const response = await axios.patch(`${getRouteURL(baseURL, resource)}/${resource}`, { params });
    return response.data;
  },
  updateMany: async (resource, params) => {},
  delete: async (resource, params) => {},
  deleteMany: async (resource, params) => {},
});
