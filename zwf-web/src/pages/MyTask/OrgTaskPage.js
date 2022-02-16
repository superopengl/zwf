import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Skeleton, Row, Col, Collapse, Button, Drawer, Space, Card } from 'antd';
import { assignTask$, changeTaskStatus$, getTask$, saveTaskFields$, updateTaskTags$ } from 'services/taskService';
import * as queryString from 'query-string';
import { PageContainer } from '@ant-design/pro-layout';
import { catchError } from 'rxjs/operators';
import { TaskStatusButton } from 'components/TaskStatusButton';
import { TagSelect } from 'components/TagSelect';
import { GlobalContext } from 'contexts/GlobalContext';
import { TaskIcon } from 'components/entityIcon';
import { TaskChatPanel } from 'components/TaskChatPanel';
import { TaskFormPanel } from 'components/TaskFormPanel';
import { CaretRightOutlined, CheckOutlined, DeleteOutlined, FileAddOutlined, LinkOutlined, MessageOutlined, SaveOutlined, ShareAltOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { AiOutlineHistory } from 'react-icons/ai';
import { UserDisplayName } from 'components/UserDisplayName';
import { UserAvatar } from 'components/UserAvatar';
import { FaSignature } from 'react-icons/fa';
import { MemberSelect } from 'components/MemberSelect';
import { notify } from 'util/notify';
import { showTaskDeepLinkModal } from 'components/showTaskDeepLinkModal';

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
  const [messageVisible, setMessageVisible] = React.useState(false);
  const [task, setTask] = React.useState();
  const [assigneeId, setAssigneeId] = React.useState();
  const context = React.useContext(GlobalContext);

  const formRef = React.createRef();
  const currentUserId = context.user?.id;

  React.useEffect(() => {
    const subscription$ = getTask$(id).pipe(
      catchError(() => setLoading(false))
    )
      .subscribe((taskInfo) => {
        const { email, role, userId, orgId, orgName, ...task } = taskInfo;
        setTask(task);
        setAssigneeId(task.agentId);
        setLoading(false);
      });
    return () => {
      subscription$.unsubscribe();
    }
  }, []);

  const handleGoBack = () => {
    props.history.goBack();
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

  const handleSaveTaskForm = () => {
    saveTaskFields$(task).pipe(
      catchError(e => {
        notify.error('Failed to save task', e.message);
      })
    ).subscribe();
  }

  return (<>
    <ContainerStyled>
      {task && <PageContainer
        loading={loading}
        onBack={handleGoBack}
        backIcon={false}
        ghost={true}
        fixedHeader
        header={{
          title: <><TaskIcon /> {task?.name || <Skeleton paragraph={false} />}</>
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
              <TaskFormPanel ref={formRef} value={task} type="client" onChange={handleTaskFieldsChange} />
            </Card>
            <Row justify="end" style={{ marginTop: 20 }}>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveTaskForm}>Save</Button>
            </Row>
            {/* <em>{JSON.stringify(task.fields, null, 2)}</em> */}
          </Col>
          <Col span={8} style={{ minWidth: 300 }}>
            <Collapse defaultActiveKey={['client', 'tags', 'assignee', 'procedure', 'actions', 'history']} expandIconPosition="right" ghost expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
              <Collapse.Panel key="client" header="Client">
                {task?.client && <Space size="small" style={{ paddingLeft: 12, paddingRight: 12 }}>
                  <UserAvatar value={task.client.avatarFileId} color={task.client.avatarColorHex} size={32} />
                  <UserDisplayName
                    email={task.client.email}
                    surname={task.client.surname}
                    givenName={task.client.givenName}
                  />
                </Space>}
              </Collapse.Panel>
              <Collapse.Panel key="assignee" header="Assignee">
                <MemberSelect value={assigneeId} onChange={handleChangeAssignee} />
              </Collapse.Panel>
              <Collapse.Panel key="tags" header="Tags">
                <TagSelect value={task.tags.map(t => t.id)} onChange={handleTagsChange} />
              </Collapse.Panel>
              <Collapse.Panel key="procedure" header="Procedures">
                <Space style={{ width: '100%' }} direction="vertical" className="action-buttons" size="small">
                  <Button type="link" icon={<LinkOutlined />} block onClick={() => setMessageVisible(true)}>How to do it</Button>
                  <Button type="link" icon={<LinkOutlined />} block onClick={() => setMessageVisible(true)}>Best practice</Button>
                </Space>
              </Collapse.Panel>
              <Collapse.Panel key="actions" header="Actions">
                <Space style={{ width: '100%' }} direction="vertical" className="action-buttons" siza="small">
                  <Button type="link" icon={<MessageOutlined />} block onClick={() => setMessageVisible(true)}>Messages</Button>
                  <Button type="link" icon={<Icon component={() => <AiOutlineHistory />} />} block onClick={() => setMessageVisible(true)}>Action history</Button>
                  <Button type="link" icon={<ShareAltOutlined />} block onClick={() => showTaskDeepLinkModal(task.deepLinkId)}>Share deep link</Button>
                  <hr />
                  <Button type="link" icon={<FileAddOutlined />} block onClick={() => setMessageVisible(true)}>Request client for more information</Button>
                  <Button type="link" icon={<Icon component={() => <FaSignature />} />} block onClick={() => setMessageVisible(true)}>Request client for signature</Button>
                  <Button type="link" icon={<CheckOutlined />} block onClick={() => setMessageVisible(true)}>Complete this task</Button>
                  <hr />
                  <Button type="link" danger icon={<DeleteOutlined />} block onClick={() => setMessageVisible(true)}>Archive this task</Button>
                </Space>
              </Collapse.Panel>
            </Collapse>
          </Col>
        </Row>
      </PageContainer>}
      {task && <Drawer
        visible={messageVisible}
        onClose={() => setMessageVisible(false)}
        title="Message"
        destroyOnClose
        closable
        maskClosable
      >
        <TaskChatPanel taskId={task.id} currentUserId={currentUserId} />
      </Drawer>}
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
