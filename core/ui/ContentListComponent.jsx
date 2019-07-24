import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import Link from 'next/link';
import { deleteContent } from '../../core/client/api/content';

const deleteContentFunc = async (contentType, slug) => {
  await deleteContent(contentType, slug);
};

const ContentListComponent = ({ contentList, contentType }) => {
  return (
    <List>
      {contentList.map(entry => (
        <ListItem key={`list-item-${entry.slug}`}>
          <Link href={`/admin/content/edit?slug=${entry.slug}&contentType=${contentType}`}>
            {entry.slug}
          </Link>
          <Button onClick={() => deleteContentFunc(contentType, entry.slug)}>Delete content</Button>
        </ListItem>
      ))}
    </List>
  );
};

export default ContentListComponent;
