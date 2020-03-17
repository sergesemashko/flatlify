import { Datagrid, List, TextField, PostListActionToolbar, EditButton } from 'ra-ui-materialui';
import React from 'react';

export const ContentTypeList = props => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="type" />
      <EditButton />
    </Datagrid>
  </List>
);
