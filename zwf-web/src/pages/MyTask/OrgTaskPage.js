import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Skeleton, Row, Col, Collapse, Button, Drawer, Space } from 'antd';

import { assignTask$, changeTaskStatus$, getTask$, updateTaskTags$ } from 'services/taskService';
import * as queryString from 'query-string';
import { PageContainer } from '@ant-design/pro-layout';
import { catchError } from 'rxjs/operators';
import { TaskStatusButton } from 'components/TaskStatusButton';
import { TagSelect } from 'components/TagSelect';
import { GlobalContext } from 'contexts/GlobalContext';
import { TaskIcon } from 'components/entityIcon';
import { TaskChatPanel } from 'components/TaskChatPanel';
import { TaskFormPanel } from 'components/TaskFormPanel';
import { CaretRightOutlined, CheckOutlined, DeleteOutlined, FileAddOutlined, MessageOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { AiOutlineHistory } from 'react-icons/ai';
import { UserDisplayName } from 'components/UserDisplayName';
import { UserAvatar } from 'components/UserAvatar';
import { FaSignature } from 'react-icons/fa';
import { MemberSelect } from 'components/MemberSelect';

const ContainerStyled = styled(Layout.Content)`
margin: 0 auto 0 auto;
padding: 0;
// text-align: center;
max-width: 1000px;
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
    assignTask$(task.id, newAssigneeId).subscribe(()=>{
      setAssigneeId(newAssigneeId);
    });
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
          // <Button key="message" icon={<MessageOutlined />} onClick={() => setMessageVisible(true)}>Messages</Button>,
          <TaskStatusButton key="status" value={task.status} onChange={handleStatusChange} />
        ]}
      // footer={[
      //   <Button key="reset" onClick={handleReset}>Reset</Button>,
      //   <Button key="submit" type="primary" onClick={handleSubmit}>Submit</Button>
      // ]}
      >
        <Row wrap={false} gutter={40}>
          <Col flex={1}>
            <TaskFormPanel ref={formRef} value={task} type="client" onChangeLoading={setLoading} />
          </Col>
          <Col style={{ width: 400 }}>
            <Collapse defaultActiveKey={['client', 'tags', 'assignee', 'actions', 'history']} expandIconPosition="right" ghost expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
              <Collapse.Panel key="client" header="Client">
                {task?.client && <Space size="small" style={{paddingLeft: 12, paddingRight: 12}}>
                  <UserAvatar value={task.client.avatarFileId} color={task.client.avatarColorHex} size={32} />
                  <UserDisplayName
                    email={task.client.email}
                    surname={task.client.surname}
                    givenName={task.client.givenName}
                  />
                </Space>}
              </Collapse.Panel>
              <Collapse.Panel key="assignee" header="Assignee">
                <MemberSelect value={assigneeId} onChange={handleChangeAssignee}/>
              </Collapse.Panel>
              <Collapse.Panel key="tags" header="Tags">
                <TagSelect value={task.tags.map(t => t.id)} onChange={handleTagsChange} />
              </Collapse.Panel>
              <Collapse.Panel key="actions" header="Actions">
                <Space style={{ width: '100%' }} direction="vertical" className="action-buttons">
                  <Button type="link" icon={<MessageOutlined />} block onClick={() => setMessageVisible(true)}>Messages</Button>
                  <Button type="link" icon={<Icon component={() => <AiOutlineHistory />} />} block onClick={() => setMessageVisible(true)}>Action history</Button>
                  <hr/>
                  <Button type="link"  icon={<FileAddOutlined />} block onClick={() => setMessageVisible(true)}>Request client for form info</Button>
                  <Button type="link" icon={<Icon component={() => <FaSignature />} />} block onClick={() => setMessageVisible(true)}>Request client for signature</Button>
                  <Button type="link" icon={<CheckOutlined />} block onClick={() => setMessageVisible(true)}>Complete this task</Button>
                  <hr/>
                  <Button type="link" danger icon={<DeleteOutlined/>} block onClick={() => setMessageVisible(true)}>Archive this task</Button>
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
