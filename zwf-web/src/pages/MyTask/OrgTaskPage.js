import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Space, Button, Skeleton } from 'antd';

import { changeTaskStatus$, getTask, getTask$ } from 'services/taskService';
import MyTaskSign from './MyTaskSign';
import TaskFormWizard from './TaskFormWizard';
import MyTaskReadView from './MyTaskReadView';
import * as queryString from 'query-string';
import { MessageFilled } from '@ant-design/icons';
import { TaskStatus } from 'components/TaskStatus';
import { Loading } from 'components/Loading';
import { PageContainer } from '@ant-design/pro-layout';
import { TaskWorkPanel } from 'components/TaskWorkPanel';
import { catchError } from 'rxjs/operators';
import ProCard from '@ant-design/pro-card';
import { TaskStatusButton } from 'components/TaskStatusButton';

const ContainerStyled = styled(Layout.Content)`
margin: 0 auto 0 auto;
padding: 0;
// text-align: center;
// max-width: 1000px;
width: 100%;
height: 100%;

.ant-layout-sider-zero-width-trigger {
  top: 0;
  left: -60px;
  width: 40px;
  border: 1px solid rgb(217,217,217);
  border-radius:4px;
}
`;


const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const OrgTaskPage = (props) => {
  const id = props.match.params.id;
  const isNew = !id || id === 'new';

  const { chat, portfolioId } = queryString.parse(props.location.search);
  const [chatVisible, setChatVisible] = React.useState(Boolean(chat));
  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();
  const formRef = React.createRef();

  React.useEffect(() => {
    const subscription$ = getTask$(id)
      .pipe(
        catchError(() => setLoading(false))
      )
      .subscribe(taskInfo => {
        const { email, role, userId, orgId, orgName, ...task } = taskInfo;
        setTask(task);
        setLoading(false);
      });
    return () => {
      subscription$.unsubscribe();
    }
  }, []);
  // const loadEntity = async () => {
  //   setLoading(true);
  //   if (id && !isNew) {
  //     const task = await getTask(id);
  //     setTask(task);
  //   }
  //   setLoading(false);
  // }

  // React.useEffect(() => {
  //   loadEntity();
  // }, [])

  const onOk = () => {
    props.history.push('/tasks');
  }
  const onCancel = () => {
    props.history.goBack();
  }

  const toggleChatPanel = () => {
    setChatVisible(!chatVisible);
  }

  const handleSubmit = () => {
    formRef.current.submit();
  }

  const handleReset = () => {
    formRef.current.resetFields();
  }

  const showsEditableForm = isNew || task?.status === 'todo';
  const showsSign = task?.status === 'to_sign';
  const showsChat = !isNew;

  const handleStatusChange = newStatus => {
    if (newStatus !== task.status) {
      setLoading(true);
      changeTaskStatus$(task.id, newStatus).subscribe(() => {
        setTask({ ...task, status: newStatus });
        setLoading(false);
      })
    }
  }

  return (<>
    <ContainerStyled>
      {task && <PageContainer
        loading={loading}
        fixedHeader
        header={{
          title: task?.name || <Skeleton paragraph={false} />
        }}
        // content={<Paragraph type="secondary">{value.description}</Paragraph>}
        extra={[
          // <Button key="reset" onClick={handleReset}>Reset</Button>,
          // <Button key="submit" type="primary" onClick={handleSubmit}>Submit</Button>,
          <TaskStatusButton key="status" value={task.status} onChange={handleStatusChange} />
        ]}
      // footer={[
      //   <Button key="reset" onClick={handleReset}>Reset</Button>,
      //   <Button key="submit" type="primary" onClick={handleSubmit}>Submit</Button>
      // ]}
      >
        <TaskWorkPanel ref={formRef} task={task} type="agent" />
      </PageContainer>}
    </ContainerStyled>
  </>
  );
};

OrgTaskPage.propTypes = {
  // id: PropTypes.string.isRequired
};

OrgTaskPage.defaultProps = {
  // taskId: 'new'
};

export default withRouter(OrgTaskPage);
