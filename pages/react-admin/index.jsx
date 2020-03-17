import React from 'react';
import dynamic from 'next/dynamic';

const ReactAdminWithNoSSR = dynamic(() => import('../../core/react-admin/App'), {
  ssr: false,
});

export default () => <ReactAdminWithNoSSR />;
