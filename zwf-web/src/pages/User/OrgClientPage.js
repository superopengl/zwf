import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Input, Row, Col, Collapse, Button, Typography, Tooltip, Space, Drawer } from 'antd';
import { addDocTemplateToTask$, assignTask$, changeTaskStatus$, getTask$, renameTask$, updateTaskTags$ } from 'services/taskService';
import { catchError, finalize } from 'rxjs/operators';
import { TaskStatusButton } from 'components/TaskStatusButton';
import { TagSelect } from 'components/TagSelect';
import { TaskIcon } from 'components/entityIcon';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import Icon, { CaretRightOutlined, CheckOutlined, CloseOutlined, EditOutlined, FileAddOutlined, MessageOutlined, PlusOutlined, ShareAltOutlined, SyncOutlined } from '@ant-design/icons';
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
import { TaskDocListPanel } from 'components/TaskDocListPanel';
import { ZeventNoticeableBadge } from 'components/ZeventNoticeableBadge';
import { ClientNameCard } from 'components/ClientNameCard';
import { TaskCommentPanel } from 'components/TaskCommentPanel';
import { TaskLogDrawer } from 'components/TaskLogDrawer';
import { BsFillTrash3Fill } from 'react-icons/bs';
import PropTypes from 'prop-types';
import { getOrgClientDataBag$, getOrgClient$ } from 'services/clientService';

const { Link: TextLink, Text } = Typography;

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
`;


const OrgClientPage = React.memo(() => {
  useAssertRole(['admin', 'agent'])
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = React.useState(true);
  const [client, setClient] = React.useState();
  const navigate = useNavigate();

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
            name: client?.name
          }
        ]}
        // fixedHeader
        title={<ClientNameCard id={id} />}
        // icon={<TaskIcon />}
        // content={<Paragraph type="secondary">{value.description}</Paragraph>}
        extra={[
          // <ZeventNoticeableBadge key="refresh"
          //   message="This task has changes. Click to refresh"
          //   filter={z => z.type === 'task.change' && z.taskId === client.id}
          // >
          //   <Button icon={<SyncOutlined />} onClick={() => load$()} />
          // </ZeventNoticeableBadge>,
          // <ZeventNoticeableBadge key="comment"
          //   message="This task has unread comment"
          //   filter={z => z.type === 'task.comment' && z.taskId === task.id}
          // >
          //   <Button icon={<MessageOutlined />} onClick={() => setHistoryVisible(true)} />
          // </ZeventNoticeableBadge>,
          // <TaskStatusButton key="status" value={client.status} onChange={handleStatusChange} />
          // <Button key="save" icon={<SaveOutlined />} onClick={handleSaveForm}>Save <Form></Form></Button>,
        ]}
      >
        <ProCard style={{ marginBlockStart: 8 }} gutter={8} ghost>
          <ProCard colSpan={16} layout="center" bordered title="Remark">
            <Input.TextArea
              defaultValue={client?.remark}
              autoSize={{ minRows: 3 }}
              maxLength={1000}
              showCount
              allowClear
              style={{ marginBottom: '1rem' }} />
          </ProCard>
          <ProCard colSpan={8} layout="center" bordered title="Basic information">
            Col
          </ProCard>
        </ProCard>
        {/* <Row gutter={[30, 30]} >
          <Col span={14}>
          <Row gutter={[30, 30]} >
              <Col span={24} >
              <ProCard
              title="Form"
              type="inner"
              extra={<Button onClick={handleEditFields} icon={<EditOutlined />}>Edit</Button>}
              >
              {client?.fields.length>0 ?
                <AutoSaveTaskFormPanel value={client} mode="agent" onSavingChange={setSaving} /> :
                <Row justify="center">
                  <Text type="secondary">No fields defined. <TextLink onClick={handleEditFields}>Click to add</TextLink></Text>
                </Row>
              }
             </ProCard>
              </Col>
              <Col span={24} >
                <TaskDocListPanel task={client} onChange={() => load$()} />
              </Col>
            </Row>
          </Col>
          <Col span={10}>
            <Row gutter={[30, 30]} >
              <Col span={24}>
                <ProCard>
                  <Collapse defaultActiveKey={['client', 'tags', 'assignee', 'actions']} expandIconPosition="end" ghost expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
                    <Collapse.Panel key="client" header="Client">
                      <ClientNameCard id={client?.orgClientId} />
                    </Collapse.Panel>
                    <Collapse.Panel key="assignee" header="Assignee">
                      <MemberSelect value={assigneeId} onChange={handleChangeAssignee} bordered={false} />
                    </Collapse.Panel>
                    <Collapse.Panel key="tags" header="Tags">
                      <TagSelect value={client.tags.map(t => t.id)} onChange={handleTagsChange} bordered={false} placeholder="Select tags" />
                    </Collapse.Panel>
                    <Collapse.Panel key="actions" header="Actions">
                      <Space style={{ width: '100%' }} direction="vertical" className="action-buttons" siza="small">
                        <Button type="link" icon={<ShareAltOutlined />} onClick={() => showShareTaskDeepLinkModal(client.deepLinkId)}>Share link</Button>
                        {!hasFinished && <Button type="link" icon={<CheckOutlined />} block onClick={() => showCompleteTaskModal(client.id)}>Complete this task</Button>}
                        {client.status !== 'archived' && <Button type="link" danger icon={<Icon component={BsFillTrash3Fill} />} onClick={() => showArchiveTaskModal(client.id, load$)}>Archive</Button>}
                      </Space>
                    </Collapse.Panel>
                  </Collapse>
                </ProCard>
              </Col>
              {client && <Col span={24}>
                <ProCard
                  // title="Comments"
                  // type="inner"
                >
                <TaskCommentPanel taskId={client.id} />
                </ProCard>
              </Col>}
            </Row>
          </Col>
        </Row> */}
      </PageHeaderContainer>}
      {/* {client && <TaskLogDrawer taskId={client.id} visible={historyVisible} onClose={() => setHistoryVisible(false)} />} */}
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
