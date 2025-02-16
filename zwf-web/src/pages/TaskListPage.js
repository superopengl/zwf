import React from 'react';
import { useAssertRole } from 'hooks/useAssertRole';
import loadable from '@loadable/component'
import { useRole } from 'hooks/useRole';
const OrgTaskListPage = loadable(() => import('pages/OrgBoard/OrgTaskListPage'));
const ClientTaskListPage = loadable(() => import('pages/ClientTask/ClientTaskListPage'));

const TaskListPage = () => {
  useAssertRole(['client', 'admin', 'agent']);
  const role = useRole();

  return role === 'client' ? <ClientTaskListPage/> : <OrgTaskListPage />
}

export default TaskListPage;
