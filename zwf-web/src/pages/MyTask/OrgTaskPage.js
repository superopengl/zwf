import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Skeleton, Row, Col, Button, Typography, Space } from 'antd';
import { assignTask$, changeTaskStatus$, getTask$, renameTask$, updateTaskTags$ } from 'services/taskService';
import { finalize } from 'rxjs/operators';
import { TaskStatusButton } from 'components/TaskStatusButton';
import { TagSelect } from 'components/TagSelect';
import { TaskIcon } from 'components/entityIcon';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import Icon, { CheckOutlined, CommentOutlined, EditOutlined, FileAddOutlined, ShareAltOutlined, SyncOutlined } from '@ant-design/icons';
import { MemberSelect } from 'components/MemberSelect';
import { useShareTaskDeepLinkModal } from 'components/showShareTaskDeepLinkModal';
import { showArchiveTaskModal } from 'components/showArchiveTaskModal';
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
import { BsFillSendFill, BsFillTrash3Fill, BsInputCursorText } from 'react-icons/bs';
import { Descriptions } from 'antd';
import { Drawer } from 'antd';
import { Divider } from 'antd';
import { FaSignature } from 'react-icons/fa';
import { useRequestActionModal } from 'hooks/useRequestActionModal';
import { MdEditNote } from 'react-icons/md';

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

.ant-descriptions-item {
  .ant-divider {
    margin-top: 4px;
    margin-bottom: 4px;
  }
}
`;


const OrgTaskPage = React.memo(() => {
  useAssertRole(['admin', 'agent'])
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = React.useState(true);
  const [historyVisible, setHistoryVisible] = React.useState(false);
  const [task, setTask] = React.useState();
  const [saving, setSaving] = React.useState(null);
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [assigneeId, setAssigneeId] = React.useState();
  const navigate = useNavigate();
  const [openDeepLink, deepLinkContextHolder] = useShareTaskDeepLinkModal();
  const [openRequestActionModal, requestActionContextHolder] = useRequestActionModal();

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe()
  }, [id]);

  const load$ = () => {
    return getTask$(id).pipe(
      finalize(() => setLoading(false))
    ).subscribe((taskInfo) => {
      const { email, role, orgId, orgName, ...task } = taskInfo;
      setTask(task);
      setAssigneeId(task.assigneeId);
      // if (taskInfo.fields.length) {
      //   setTask(task);
      //   setAssigneeId(task.assigneeId);
      // } else {
      //   navigate(`/task/${id}/edit`)
      // }
    });
  }

  const handleGoBack = () => {
    navigate(-1);
  }

  const handleStatusChange = newStatus => {
    if (newStatus !== task.status) {
      setLoading(true);
      changeTaskStatus$(task.id, newStatus).subscribe(() => {
        setTask({ ...task, status: newStatus });
        setLoading(false);
      })
    }
  }

  const handleTagsChange = tagIds => {
    updateTaskTags$(task.id, tagIds).subscribe()
  }

  const handleChangeAssignee = assigneeId => {
    assignTask$(task.id, assigneeId).subscribe(() => {
      setAssigneeId(assigneeId);
    });
  }


  const handleRename = (name) => {
    renameTask$(task.id, name).subscribe(() => {
      setTask({ ...task, name });
    })
  }

  const handleEditFields = () => {
    navigate(`/task/${task?.id}/edit`)
  }

  const hasFinished = ['archived', 'done'].includes(task?.status)

  const handleRequestAction = () => {
    openRequestActionModal(task.id, () => {
      load$();
    })
  }

  return (<>
    <ContainerStyled>
      {task && <PageHeaderContainer
        loading={loading}
        onBack={handleGoBack}
        ghost={true}
        breadcrumb={[
          {
            name: 'Tasks'
          },
          {
            path: '/task',
            name: 'Tasks',
          },
          {
            name: task?.name
          }
        ]}
        // fixedHeader
        title={task?.name ? <ClickToEditInput
          placeholder="Task name"
          value={task.name} size={22}
          onChange={handleRename}
          maxLength={100} /> : <Skeleton paragraph={false} />}
        icon={<TaskIcon />}
        // content={<Paragraph type="secondary">{value.description}</Paragraph>}
        extra={[
          // <ZeventNoticeableBadge key="refresh"
          //   message="This task has changes. Click to refresh"
          //   filter={z => z.type === 'task.change' && z.taskId === task.id}
          // >
          //   <Button icon={<SyncOutlined />} onClick={() => load$()} />
          // </ZeventNoticeableBadge>,
          // <ZeventNoticeableBadge key="comment"
          //   message="This task has unread comment"
          //   filter={z => z.type === 'task.comment' && z.taskId === task.id}
          // >
          //   <Button icon={<MessageOutlined />} onClick={() => setHistoryVisible(true)} />
          // </ZeventNoticeableBadge>,
          // <ClientNameCard id={task?.orgClientId} size={54} showTooltip={true} />
          // ,
          // <Button key="save" icon={<SaveOutlined />} onClick={handleSaveForm}>Save <Form></Form></Button>,
        ]}
      // footer={[
      //   <Button key="reset" onClick={handleReset}>Reset</Button>,
      //   <Button key="submit" type="primary" onClick={handleSubmit}>Submit</Button>
      // ]}
      >
        <Row gutter={[50, 40]} wrap={false} style={{paddingTop: 30}}>
          <Col flex="2 2 400px">
            <Row gutter={[40, 40]}>
              <Col span={24}>
                <OrgTaskDocListPanel task={task} onChange={() => load$()} />
              </Col>
              <Col span={24}>
                <ProCard title="Form" extra={<Button onClick={handleEditFields}>Edit fields</Button>}>
                  {task?.fields.length > 0 ?
                    <AutoSaveTaskFormPanel value={task} mode="agent" onSavingChange={setSaving} /> :
                    <Row justify="center">
                      <Text type="secondary">No fields defined. <TextLink onClick={handleEditFields}>Click to add</TextLink></Text>
                    </Row>
                  }
                </ProCard>
              </Col>
            </Row>
          </Col>
          <Col flex="0 0 340px">
            <ProCard ghost>
              <ClientNameCard id={task?.orgClientId} size={54} showTooltip={true} />
              <Descriptions layout="vertical" column={1} style={{ marginTop: 20 }}>
                <Descriptions.Item label="Status">
                  <TaskStatusButton style={{ width: '100%' }} key="status" value={task.status} onChange={handleStatusChange} />
                </Descriptions.Item>
                <Descriptions.Item label="Assignee">
                  <MemberSelect value={assigneeId} onChange={handleChangeAssignee} bordered={true} />
                </Descriptions.Item>
                <Descriptions.Item label="Tags">
                  <TagSelect value={task.tags.map(t => t.id)} onChange={handleTagsChange} bordered={true} placeholder="Select tags" />
                </Descriptions.Item>
                <Descriptions.Item label="Actions">
                  <Space style={{ width: '100%' }} direction="vertical" className="action-buttons" siza="small">
                    {/* {!hasFinished && <Button type="link" icon={<FileAddOutlined />} block onClick={() => showRequireActionModal(task.id)}>Request client for more information</Button>} */}
                    <Button type="text" block icon={<ShareAltOutlined />} onClick={() => openDeepLink(task.deepLinkId)}>Share link</Button>
                    <Button type="text" block icon={<CommentOutlined />} onClick={() => setCommentsOpen(true)}>Comments</Button>
                    <Button type="text" block icon={<Icon component={MdEditNote} />} onClick={handleEditFields}>Edit fields</Button>
                    <Divider />
                    <Button type="text" block icon={<Icon component={BsFillSendFill} />} onClick={handleRequestAction}>Request client's actions</Button>
                    <Divider />
                    {!hasFinished && <Button type="text" icon={<CheckOutlined />} block onClick={() => showCompleteTaskModal(task.id)}>Complete this task</Button>}
                    {task.status !== 'archived' && <Button type="text" danger block icon={<Icon component={BsFillTrash3Fill} />} onClick={() => showArchiveTaskModal(task.id, load$)}>Archive</Button>}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </ProCard>
          </Col>
        </Row>
      </PageHeaderContainer>}
      {task && <TaskLogDrawer taskId={task.id} visible={historyVisible} onClose={() => setHistoryVisible(false)} />}
      {saving && <SavingAffix />}
      {deepLinkContextHolder}
      <Drawer
        title="Comments"
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      // mask={false}
      >
        {task && <TaskCommentPanel taskId={task.id} />}
      </Drawer>
      <div>
        {requestActionContextHolder}
      </div>
    </ContainerStyled>
  </>
  );
});

OrgTaskPage.propTypes = {
  // id: PropTypes.string.isRequired
};

OrgTaskPage.defaultProps = {
  // taskId: 'new'
};

export default OrgTaskPage;
