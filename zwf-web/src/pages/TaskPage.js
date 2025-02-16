import React from 'react';
import { useAssertRole } from 'hooks/useAssertRole';
import loadable from '@loadable/component'
import { useRole } from 'hooks/useRole';
const OrgTaskPage = loadable(() => import('pages/MyTask/OrgTaskPage'));
const ClientTaskPage = loadable(() => import('pages/Org/ClientTaskPage'));

const TaskPage = () => {
  useAssertRole(['client', 'admin', 'agent']);
  const role = useRole();

  return role === 'client' ? <ClientTaskPage/> : <OrgTaskPage />
}

export default TaskPage;
