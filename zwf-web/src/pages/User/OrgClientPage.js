import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Input, Row, Col, Collapse, Button, Typography, Alert, Space, Drawer } from 'antd';
import { addDemplateToTask$, assignTask$, changeTaskStatus$, getTask$, renameTask$, updateTaskTags$ } from 'services/taskService';
import { catchError, finalize } from 'rxjs/operators';
import { TaskStatusButton } from 'components/TaskStatusButton';
import { TagSelect } from 'components/TagSelect';
import { TaskIcon } from 'components/entityIcon';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import Icon, { CaretRightOutlined, CheckOutlined, CloseOutlined, EditOutlined, FileAddOutlined, MessageOutlined, PlusOutlined, SaveFilled, SaveOutlined, ShareAltOutlined, SyncOutlined } from '@ant-design/icons';
import { MemberSelect } from 'components/MemberSelect';
import { showShareTaskDeepLinkModal } from 'components/showShareTaskDeepLinkModal';
import { showArchiveTaskModal } from 'components/showArchiveTaskModal';
import { UserNameCard } from 'components/UserNameCard';
import { SavingAffix } from 'components/SavingAffix';
import { showCompleteTaskModal } from 'components/showCompleteTaskModal';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { ProCard } from '@ant-design/pro-components';
import { useAssertRole } from 'hooks/useAssertRole';
import { OrgTaskDocListPanel } from 'components/OrgTaskDocListPanel';
import { ZeventNoticeableBadge } from 'components/ZeventNoticeableBadge';
import { ClientNameCard } from 'components/ClientNameCard';
import { TaskCommentPanel } from 'components/TaskCommentPanel';
import { TaskLogDrawer } from 'components/TaskLogDrawer';
import { BsFillSendFill, BsFillTrash3Fill } from 'react-icons/bs';
import PropTypes from 'prop-types';
import { getOrgClientDataBag$, getOrgClient$, updateOrgClient$, refreshClientNameCardCache } from 'services/clientService';
import { OrgClientFieldsPanel } from 'pages/OrgBoard/OrgClientFieldsPanel';
import { MdDashboardCustomize } from 'react-icons/md';
import { useCreateTaskModal } from 'hooks/useCreateTaskModal';
import { Tooltip } from 'antd';
import { ClientInfoPanel } from 'pages/OrgBoard/ClientInfoPanel';
import { InviteClientInput } from 'components/InviteClientInput';
import { TaskBoardPanel } from 'pages/OrgBoard/TaskBoardPanel';

const { Link: TextLink, Text, Paragraph } = Typography;

const ContainerStyled = styled(Layout.Content)`
margin: 0 auto 0 auto;
padding: 0;
// text-align: center;
min-width: 800px;
max-width: 1200px;
width: 100%;
height: 100%;

.ant-layout-sider-zero-width-trigger {
  top: 0;
  left: -60px;
  width: 40px;
  border: 1px solid rgb(217,217,217);
border-radius:4px;
}

.action-buttons {
  button {
    text-align: left;
    padding-left: 0;
  }
}

.ant-collapse-item {
  .ant-collapse-content-box, .ant-collapse-header {
    padding-left:0;
    padding-right:0;
  }
}

.ant-tabs  {
  padding-left: 0;
}
`;


const OrgClientPage = React.memo(() => {
  useAssertRole(['admin', 'agent'])
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = React.useState(true);
  const [client, setClient] = React.useState();
  const navigate = useNavigate();
  const [openTaskCreator, taskCreatorContextHolder] = useCreateTaskModal();

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe()
  }, [id]);

  const load$ = () => {
    return getOrgClient$(id).pipe(
      finalize(() => setLoading(false))
    ).subscribe((clientInfo) => {
      const { email, role, orgId, orgName, ...task } = clientInfo;
      setClient(task);
    });
  }

  const handleGoBack = () => {
    navigate(-1);
  }

  const handleFieldsChange = (femplateId, fields) => {
    updateOrgClient$(client.id, { femplateId, fields }).subscribe();
  }

  const handleTagChange = (tags) => {
    updateOrgClient$(client.id, { tags }).subscribe();
  }

  const handleRemarkChange = (remark) => {
    updateOrgClient$(client.id, { remark }).subscribe();
  }

  const createTaskForClient = () => {
    openTaskCreator({
      client,
      onOk: () => {
        load$();
      }
    });
  }

  const handlePostInvite = () => {
    refreshClientNameCardCache(client.id);
    load$()
  }

  return (<>
    <ContainerStyled>
      {client && <PageHeaderContainer
        loading={loading}
        onBack={handleGoBack}
        ghost={true}
        breadcrumb={[
          {
            name: 'Users'
          },
          {
            path: '/client',
            name: 'Clients',
          },
          {
            name: client?.clientAlias
          }
        ]}
        // fixedHeader
        title={"Client"}
        // icon={<TaskIcon />}
        // content={<Paragraph type="secondary">{value.description}</Paragraph>}
        extra={[
          // <ZeventNoticeableBadge key="refresh"
          //   message="This task has changes. Click to refresh"
          //   filter={z => z.type === 'task.change' && z.taskId === client.id}
          // >
          <Button icon={<SyncOutlined />} onClick={() => load$()} />,
          // </ZeventNoticeableBadge>,
          // <ZeventNoticeableBadge key="comment"
          //   message="This task has unread comment"
          //   filter={z => z.type === 'task.comment' && z.taskId === task.id}
          // >
          // <Button icon={<Icon component={MdDashboardCustomize} />} onClick={createTaskForClient} type="primary" ghost >New Task</Button>,
          // </ZeventNoticeableBadge>,
          // <TaskStatusButton key="status" value={client.status} onChange={handleStatusChange} />
          // <Button key="save" icon={<SaveOutlined />} onClick={handleSaveForm}>Save <Form></Form></Button>,
        ]}
      >

        <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
          <Col span={12}>
            <div style={{ marginBottom: 20 }}>
              <ClientNameCard id={id} allowChangeAlias={true} size={60} bordered={true} />
            </div>
            {client.userId ?
              <ClientInfoPanel orgClient={client} />
              : <><Paragraph
                type="warning"
                style={{ marginTop: 20 }}
              >
                The client doesn't have a ZeeWorkflow account yet. Once they're invited, you can communicate with them through ZeeWorkflow.
              </Paragraph>
                <InviteClientInput orgClientId={client.id} onFinish={handlePostInvite} />
              </>}
          </Col>

          <Col span={12}>
            <Row gutter={[10, 10]}>
              <Col span={24}>
                <ProCard title="Notes" ghost size="small">
                  <Input.TextArea
                    defaultValue={client?.remark}
                    onChange={e => handleRemarkChange(e.target.value)}
                    autoSize={{ minRows: 3 }}
                    maxLength={1000}
                    showCount
                    allowClear
                    style={{ marginBottom: '1rem' }} />
                </ProCard>
              </Col>
              <Col span={24}>
                <ProCard title="Tags" ghost size="small">
                  <TagSelect value={client.tags?.map(x => x.id)}
                    onChange={tags => handleTagChange(tags)}
                    bordered={true}
                    inPlaceEdit={true}
                    placeholder="Click to select tags"
                  />
                </ProCard>
              </Col>

            </Row>
          </Col>
        </Row>

        <ProCard
          tabs={{
            type: 'card',
          }}
          type="inner"
          ghost
        >
          <ProCard.TabPane key="profile" tab="Profile">
              <OrgClientFieldsPanel femplateId={client.femplateId} fields={client.fields} onChange={handleFieldsChange} />

          </ProCard.TabPane>
          <ProCard.TabPane key="tasks" tab="Tasks"
          >
            <ProCard ghost
              extra={<Button icon={<Icon component={MdDashboardCustomize} />}
                type="primary"
                ghost
                onClick={createTaskForClient}>New Task</Button>}
            >
              <TaskBoardPanel tasks={client.tasks ?? []} showClient={false} showTags={false} onChange={() => load$()} />
            </ProCard>
          </ProCard.TabPane>
        </ProCard>
      </PageHeaderContainer>}
      {/* {client && <TaskLogDrawer taskId={client.id} visible={historyVisible} onClose={() => setHistoryVisible(false)} />} */}
      {taskCreatorContextHolder}
    </ContainerStyled>
  </>
  );
});

OrgClientPage.propTypes = {
  id: PropTypes.string.isRequired
};

OrgClientPage.defaultProps = {
  // taskId: 'new'
};

export default OrgClientPage;
