import React from 'react';
import Link from 'next/link';
import Button from '@material-ui/core/Button';

import { list } from '../../../core/client/api/content';
import ContentListComponent from '../../../core/ui/ContentListComponent';

const ContentList = ({ contentList, contentType }) => {
  return (
    <div>
      <div>Content List</div>
      <ContentListComponent contentList={contentList} contentType={contentType} />

      <Button type="submit">
        <Link href={`/admin/content/create?contentType=${contentType}`}>Add new</Link>
      </Button>
    </div>
  );
};

ContentList.getInitialProps = async ({ query }) => {
  const contentList = await list(query.contentType);

  return {
    contentList,
    contentType: query.contentType,
  };
};

export default ContentList;
