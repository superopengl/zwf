import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Skeleton, Row, Col, Collapse, Button, Space, Tooltip, Form, Drawer } from 'antd';
import { addDocTemplateToTask$, assignTask$, changeTaskStatus$, getTask$, renameTask$, updateTaskTags$ } from 'services/taskService';
import { catchError, finalize } from 'rxjs/operators';
import { TaskStatusButton } from 'components/TaskStatusButton';
import { TagSelect } from 'components/TagSelect';
import { TaskIcon } from 'components/entityIcon';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import { CaretRightOutlined, CheckOutlined, CloseOutlined, EditOutlined, FileAddOutlined, MessageOutlined, PlusOutlined, ShareAltOutlined, SyncOutlined } from '@ant-design/icons';
import { MemberSelect } from 'components/MemberSelect';
import { showShareTaskDeepLinkModal } from 'components/showShareTaskDeepLinkModal';
import { showArchiveTaskModal } from 'components/showArchiveTaskModal';
import { UserNameCard } from 'components/UserNameCard';
import { TaskLogAndCommentDrawer } from 'components/TaskLogAndCommentDrawer';
import { SavingAffix } from 'components/SavingAffix';
import { showCompleteTaskModal } from 'components/showCompleteTaskModal';
import { showRequireActionModal } from 'components/showRequireActionModal';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { ProCard } from '@ant-design/pro-components';
import { useAssertRole } from 'hooks/useAssertRole';
import { TaskDocListPanel } from 'components/TaskDocListPanel';
import { ZeventNoticeableBadge } from 'components/ZeventNoticeableBadge';


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


const OrgTaskPage = React.memo((props) => {
  useAssertRole(['admin', 'agent'])
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = React.useState(true);
  const [historyVisible, setHistoryVisible] = React.useState(false);
  const [task, setTask] = React.useState();
  const [saving, setSaving] = React.useState(null);
  const [assigneeId, setAssigneeId] = React.useState();
  const navigate = useNavigate();

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe()
  }, [id]);

  const load$ = () => {
    return getTask$(id).pipe(
      finalize(() => setLoading(false))
    ).subscribe((taskInfo) => {
      const { email, role, orgId, orgName, ...task } = taskInfo;
      if (taskInfo.fields.length) {
        setTask(task);
        setAssigneeId(task.agentId);
      } else {
        navigate(`/task/${id}/edit`)
      }
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

  const handleChangeAssignee = agentId => {
    assignTask$(task.id, agentId).subscribe(() => {
      setAssigneeId(agentId);
    });
  }

  const handleTaskFieldsChange = fields => {
    setTask(task => ({ ...task, fields }));
  }

  const handleRename = (name) => {
    renameTask$(task.id, name).subscribe(() => {
      setTask({ ...task, name });
    })
  }

  const handleEditFields = () => {
    // openFieldEditor({
    //   fields: task.fields,
    //   onChange: handleTaskFieldsChange,
    // })

    // setEditFieldVisible(true);

    navigate(`/task/${task?.id}/edit`)
  }

  const hasFinished = ['archived', 'done'].includes(task?.status)

  const handleAddDocTemplates = (docTemplateIds) => {
    setLoading(true);
    addDocTemplateToTask$(task.id, docTemplateIds)
      .pipe(
        finalize(() => setLoading(false)),
      )
      .subscribe(setTask);
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
        title={task?.name ? <ClickToEditInput placeholder="Task name" value={task.name} size={22} onChange={handleRename} maxLength={100} /> : <Skeleton paragraph={false} />}
        icon={<TaskIcon />}
        // content={<Paragraph type="secondary">{value.description}</Paragraph>}
        extra={[
          <ZeventNoticeableBadge key="refresh"
            message="This task has changes. Click to refresh"
            filter={z => z.type === 'task.change' && z.taskId === task.id}
          >
            <Button icon={<SyncOutlined />} onClick={() => load$()} />
          </ZeventNoticeableBadge>,
          <Tooltip key="edit" title="Edit">
            <Button disabled={hasFinished} icon={<EditOutlined />} onClick={() => handleEditFields()} />
          </Tooltip>,
          <ZeventNoticeableBadge key="comment"
            message="This task has unread comment"
            filter={z => z.type === 'task.comment' && z.taskId === task.id}
          >
            <Button icon={<MessageOutlined />} onClick={() => setHistoryVisible(true)} />
          </ZeventNoticeableBadge>,
          <Tooltip key="share" title="Share">
            <Button icon={<ShareAltOutlined />} onClick={() => showShareTaskDeepLinkModal(task.deepLinkId)} />
          </Tooltip>,
          <Tooltip title="Archieve" key="archieve">
            <Button type="primary" danger icon={<CloseOutlined />} onClick={() => showArchiveTaskModal(task.id, load$)} />
          </Tooltip>,
          <TaskStatusButton key="status" value={task.status} onChange={handleStatusChange} />
          // <Button key="save" icon={<SaveOutlined />} onClick={handleSaveForm}>Save <Form></Form></Button>,
        ]}
      // footer={[
      //   <Button key="reset" onClick={handleReset}>Reset</Button>,
      //   <Button key="submit" type="primary" onClick={handleSubmit}>Submit</Button>
      // ]}
      >
        <Row gutter={[30, 30]} >
          <Col span={14}>
            <ProCard>
              <AutoSaveTaskFormPanel value={task} mode="agent" onSavingChange={setSaving} />
            </ProCard>
          </Col>
          <Col span={10}>
            <Row gutter={[30, 30]} >
              <Col span={24}>
                <ProCard>
                  <Collapse defaultActiveKey={['client', 'tags', 'assignee', 'procedure', 'actions', 'history']} expandIconPosition="end" ghost expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
                    <Collapse.Panel key="client" header="Client">
                      <UserNameCard userId={task?.userId} />
                    </Collapse.Panel>
                    <Collapse.Panel key="assignee" header="Assignee">
                      <MemberSelect value={assigneeId} onChange={handleChangeAssignee} />
                    </Collapse.Panel>
                    <Collapse.Panel key="tags" header="Tags">
                      <TagSelect value={task.tags.map(t => t.id)} onChange={handleTagsChange} />
                    </Collapse.Panel>
                    {/* <Collapse.Panel key="actions" header="Actions">
                      <Space style={{ width: '100%' }} direction="vertical" className="action-buttons" siza="small">
                        {!hasFinished && <Button type="link" icon={<FileAddOutlined />} block onClick={() => showRequireActionModal(task.id)}>Request client for more information</Button>}
                        {!hasFinished && <Button type="link" icon={<CheckOutlined />} block onClick={() => showCompleteTaskModal(task.id)}>Complete this task</Button>}
                      </Space>
                    </Collapse.Panel> */}
                  </Collapse>
                </ProCard>
              </Col>
              {task && <Col span={24}>
                <TaskDocListPanel task={task} onChange={() => load$()} />
              </Col>}
            </Row>
          </Col>
        </Row>
      </PageHeaderContainer>}
      {task && <TaskLogAndCommentDrawer taskId={task.id} userId={task.userId} visible={historyVisible} onClose={() => setHistoryVisible(false)} />}
      {saving && <SavingAffix />}
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
