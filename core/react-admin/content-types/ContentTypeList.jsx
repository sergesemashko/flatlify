import { Datagrid, List, TextField } from 'ra-ui-materialui'
import React from 'react'
import ResetViewsButton from '../components/ResetViewsButton';

const PostListBulkActions = props => (
  <>
    <ResetViewsButton {...props} />
  </>
);
export const ContentTypeList = (props) => (
  <List
    {...props}
    bulkActionButtons={<PostListBulkActions />}
  >
    <Datagrid>
      <TextField source="id"/>
      <TextField source="type"/>
    </Datagrid>
  </List>
)
