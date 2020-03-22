import { Datagrid, List, TextField } from 'ra-ui-materialui'
import React from 'react'
import GitCommitButton from '../components/GitCommitButton'
import Toolbar from '@material-ui/core/Toolbar';
import { setListSelectedIds } from 'react-admin'

const PostListBulkActions = props => (
  <>
    <GitCommitButton {...props} />
  </>
)
export const ModifiedFilesList = (props) => {
  return (
    <List
      {...props}
      actions={<Toolbar />}
      bulkActionButtons={<PostListBulkActions/>}
    >
      <Datagrid>
        <TextField source="filepath"/>
      </Datagrid>
    </List>
  )
}
