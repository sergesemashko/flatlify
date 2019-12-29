import { Datagrid, List, TextField } from 'ra-ui-materialui'
import React from 'react'
import GitCommitButton from '../components/GitCommitButton';

const PostListBulkActions = props => (
  <>
    <GitCommitButton {...props} />
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
