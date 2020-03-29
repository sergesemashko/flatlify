export const contentTypesSelector = state =>
  Object.values(state.admin.resources['content-types']?.data || {});
