import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Skeleton, Row, Col, Collapse, Button, Space, Card, Typography } from 'antd';
import { assignTask$, changeTaskStatus$, getTask$, updateTaskTags$ } from 'services/taskService';
import * as queryString from 'query-string';
import { PageContainer } from '@ant-design/pro-layout';
import { catchError } from 'rxjs/operators';
import { TaskStatusButton } from 'components/TaskStatusButton';
import { TagSelect } from 'components/TagSelect';
import { GlobalContext } from 'contexts/GlobalContext';
import { TaskIcon } from 'components/entityIcon';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import { CaretRightOutlined, CheckOutlined, DeleteOutlined, FileAddOutlined, LeftOutlined, LinkOutlined, ShareAltOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { AiOutlineHistory } from 'react-icons/ai';
import { FaSignature } from 'react-icons/fa';
import { MemberSelect } from 'components/MemberSelect';
import { showShareTaskDeepLinkModal } from 'components/showShareTaskDeepLinkModal';
import { showArchiveTaskModal } from 'components/showArchiveTaskModal';
import { UserNameCard } from 'components/UserNameCard';
import { TaskTrackingDrawer } from 'components/TaskTrackingDrawer';
import { showRenameTaskModal } from 'components/showRenameTaskModal';
import { MdDriveFileRenameOutline } from 'react-icons/md'
import { SavingAffix } from 'components/SavingAffix';
import { RiInsertRowBottom } from 'react-icons/ri';
import { TaskFieldsEditorModal } from 'components/TaskFieldsEditorModal';

const { Text } = Typography;

const ContainerStyled = styled(Layout.Content)`
margin: 0 auto 0 auto;
padding: 0;
// text-align: center;
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
`;


const OrgTaskPage = React.memo((props) => {
  const id = props.match.params.id;

  const { chat } = queryString.parse(props.location.search);
  const [loading, setLoading] = React.useState(true);
  const [historyVisible, setHistoryVisible] = React.useState(!!chat);
  const [editFieldVisible, setEditFieldVisible] = React.useState(false);
  const [task, setTask] = React.useState();
  const [saving, setSaving] = React.useState(null);
  const [assigneeId, setAssigneeId] = React.useState();
  const context = React.useContext(GlobalContext);

  React.useEffect(() => {
    const subscription$ = load$();
    return () => {
      subscription$.unsubscribe();
    }
  }, [id]);

  const load$ = () => {
    return getTask$(id).pipe(
      catchError(() => setLoading(false))
    )
      .subscribe((taskInfo) => {
        const { email, role, orgId, orgName, ...task } = taskInfo;
        setTask(task);
        setAssigneeId(task.agentId);
        setLoading(false);
      });
  }

  const handleGoBack = () => {
    props.history.push('/task');
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

  const handleChangeAssignee = memberUser => {
    const newAssigneeId = memberUser.id;
    assignTask$(task.id, newAssigneeId).subscribe(() => {
      setAssigneeId(newAssigneeId);
    });
  }

  const handleTaskFieldsChange = fields => {
    task.fields = fields;
    setTask({ ...task });
  }

  return (<>
    <ContainerStyled>
      {task && <PageContainer
        loading={loading}
        onBack={handleGoBack}
        backIcon={<LeftOutlined />}
        ghost={true}
        // fixedHeader
        header={{
          title: <Space style={{ height: 34 }}>
            <TaskIcon />
            {task?.name || <Skeleton paragraph={false} />}
          </Space>
        }}
        // content={<Paragraph type="secondary">{value.description}</Paragraph>}
        extra={[
          // <Button key="reset" onClick={handleReset}>Reset</Button>,
          <TaskStatusButton key="status" value={task.status} onChange={handleStatusChange} />
          // <Button key="save" icon={<SaveOutlined />} onClick={handleSaveForm}>Save <Form></Form></Button>,
        ]}
      // footer={[
      //   <Button key="reset" onClick={handleReset}>Reset</Button>,
      //   <Button key="submit" type="primary" onClick={handleSubmit}>Submit</Button>
      // ]}
      >
        <Row wrap={false} gutter={40}>
          <Col span={16}>
            <Card size="large">
              <AutoSaveTaskFormPanel value={task} type="agent" onSavingChange={setSaving} />
            </Card>
            {/* <em>{JSON.stringify(task.fields, null, 2)}</em> */}
          </Col>
          <Col span={8} style={{ minWidth: 300 }}>
            <Collapse defaultActiveKey={['client', 'tags', 'assignee', 'procedure', 'actions', 'history']} expandIconPosition="right" ghost expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
              <Collapse.Panel key="client" header="Client">
                <UserNameCard userId={task?.userId} />
              </Collapse.Panel>
              <Collapse.Panel key="assignee" header="Assignee">
                <MemberSelect value={assigneeId} onChange={handleChangeAssignee} />
              </Collapse.Panel>
              <Collapse.Panel key="tags" header="Tags">
                <TagSelect value={task.tags.map(t => t.id)} onChange={handleTagsChange} />
              </Collapse.Panel>
              {/* <Collapse.Panel key="procedure" header="Procedures">
                <Space style={{ width: '100%' }} direction="vertical" className="action-buttons" size="small">
                  <Button type="link" icon={<LinkOutlined />} block >How to do it</Button>
                  <Button type="link" icon={<LinkOutlined />} block >Best practice</Button>
                </Space>
              </Collapse.Panel> */}
              <Collapse.Panel key="actions" header="Actions">
                <Space style={{ width: '100%' }} direction="vertical" className="action-buttons" siza="small">
                  <Button type="link" icon={<Icon component={() => <AiOutlineHistory />} />} block onClick={() => setHistoryVisible(true)}>Interactions & Messages</Button>
                  <Button type="link" icon={<ShareAltOutlined />} block onClick={() => showShareTaskDeepLinkModal(task.deepLinkId)}>Share deep link</Button>
                  <Button type="link" icon={<Icon component={() => <MdDriveFileRenameOutline />} />} block onClick={() => showRenameTaskModal(task.id, task.name, load$)}>Rename task</Button>
                  <Button type="link" icon={<Icon component={() => <RiInsertRowBottom />} />} block onClick={() => setEditFieldVisible(true)}>Edit fields</Button>
                  <hr />
                  <Button type="link" icon={<FileAddOutlined />} block onClick={() => setHistoryVisible(true)}>Request client for more information</Button>
                  <Button type="link" icon={<Icon component={() => <FaSignature />} />} block onClick={() => setHistoryVisible(true)}>Request client for signature</Button>
                  {!['archived', 'done'].includes(task.status) && <Button type="link" icon={<CheckOutlined />} block onClick={() => setHistoryVisible(true)}>Complete this task</Button>}
                  {task.status !== 'archived' && <>
                    <hr />
                    <Button type="link" danger icon={<DeleteOutlined />} block onClick={() => showArchiveTaskModal(task.id, load$)}>Archive this task</Button>
                  </>}
                </Space>
              </Collapse.Panel>
            </Collapse>
          </Col>
        </Row>
      </PageContainer>}
      {task && <TaskTrackingDrawer taskId={task.id} visible={historyVisible} onClose={() => setHistoryVisible(false)} />}
      {task && <TaskFieldsEditorModal task={task} visible={editFieldVisible} onOk={() => {
        load$().add(() => {
          setEditFieldVisible(false)
        });
      }} onCancel={() => setEditFieldVisible(false)} />}
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

export default withRouter(OrgTaskPage);
