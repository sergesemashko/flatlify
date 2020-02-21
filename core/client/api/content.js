import axios from 'axios';
import qs from 'querystring';

const HOST = 'http://localhost:3010';

const load = async (contentType, slug) => {
  const response = await axios.get(`${HOST}/_api/content/${contentType}/${slug}`);
  return response.data;
};

const loadMedia = async name => {
  const response = await axios.get(`${HOST}/_api/content/media/${name}`);
  return response.data;
};

const mediaList = async () => {
  const response = await axios.get(`${HOST}/_api/content/media`);
  return response.data;
};

const removeMedia = async name => {
  await axios.delete(`${HOST}/_api/content/media`, { params: { name } });
  return true;
};

const saveMedia = async data => {
  const response = await axios.post(`${HOST}/_api/content/media`, data);
  return response.data;
};

const create = async (contentType, slug, data) => {
  const response = await axios.post(`${HOST}/_api/content/${contentType}`, { slug, ...data });
  return response.data;
};

const deleteContent = async (contentType, slug) => {
  const response = await axios.delete(`${HOST}/_api/content/${contentType}/${slug}`);
  return response.data;
};

const save = async (contentType, slug, data) => {
  const response = await axios.post(`${HOST}/_api/content/${contentType}/${slug}`, data);
  return response.data;
};

const list = async contentType => {
  const response = await axios.get(`${HOST}/_api/content/${contentType}`);
  return response.data;
};

const loadTypeSchema = async contentType => {
  const response = await axios.get(`${HOST}/_api/content-type/${contentType}`);
  return response.data;
};

module.exports = {
  save,
  load,
  list,
  loadTypeSchema,
  saveMedia,
  removeMedia,
  mediaList,
  loadMedia,
  create,
  deleteContent,
};
