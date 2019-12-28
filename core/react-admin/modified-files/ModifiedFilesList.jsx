import { Datagrid, List, TextField } from 'ra-ui-materialui'
import React from 'react'
import ResetViewsButton from '../components/ResetViewsButton';

const PostListBulkActions = props => (
  <>
    <ResetViewsButton {...props} />
  </>
);
export const ModifiedFilesList = (props) => (
  <List
    {...props}
    bulkActionButtons={<PostListBulkActions />}
  >
    <Datagrid>
      <TextField source="filepath"/>
    </Datagrid>
  </List>
)
