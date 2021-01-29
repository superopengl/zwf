import { Alert, Space, Tabs, Typography } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { getTask } from 'services/taskService';
import styled from 'styled-components';
import MyTaskReadView from './MyTaskReadView';
import SignDocEditor from './SignDocEditor';

const { Title } = Typography;



const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`


const MyTaskSign = (props) => {
  const { value } = props;

  const [loading] = React.useState(false);
  const [task, setTask] = React.useState(value);


  const loadEntity = async () => {
    const updatedTask = await getTask(task.id);
    setTask(updatedTask);
  }

  const { status } = task || {};
  const defaultActiveKey = status && status === 'to_sign' ? 'sign' : 'view';

  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <StyledTitleRow>
        <Title level={2} style={{ margin: 'auto' }}>Sign Task</Title>
      </StyledTitleRow>
      {status === 'signed' && <Alert
        message="The task has been signed."
        description="Please wait for the task to be completed by us."
        type="success"
        showIcon
      />}
      {status === 'to_sign' && <Alert
        message="The task requires signature."
        description="All below documents have been viewed and the task is ready to e-sign."
        type="warning"
        showIcon
      />}
      {!loading && <Tabs defaultActiveKey={defaultActiveKey}>
        <Tabs.TabPane tab="Application" key="view">
          {/* <MyTaskForm showsAll={status === 'complete'} value={task} onOk={() => goToTaskList()} /> */}
          <MyTaskReadView value={task} showsSignDoc={false}/>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Sign" key="sign">
          <SignDocEditor value={task} onOk={() => loadEntity()} />
        </Tabs.TabPane>
      </Tabs>}
      {/* <Button block type="link" onClick={() => props.history.goBack()}>Cancel</Button> */}
    </Space>
  );
};

MyTaskSign.propTypes = {
  // id: PropTypes.string.isRequired
};

MyTaskSign.defaultProps = {};

export default withRouter(MyTaskSign);
