import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Modal, Button, Skeleton, Typography, Space ,Alert } from 'antd';

import { getDeepLinkedTask$ } from 'services/taskService';
import * as queryString from 'query-string';
import { catchError, finalize } from 'rxjs/operators';
import { Logo } from 'components/Logo';
import Icon from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import PropTypes from 'prop-types';
import { LogInPanel } from 'pages/LogInPanel';
import { ForgotPasswordPanel } from 'pages/ForgotPasswordPanel';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';

const { Paragraph } = Typography

const LayoutStyled = styled(Layout)`
// margin: 0 auto 0 auto;
background-color: #ffffff;
height: 100%;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  // max-width: 1000px;
  background-color: #ffffff;
  height: 100%;
`;

const TaskDirectPage = (props) => {
  const { token } = props.match.params;

  const { chat, portfolioId } = queryString.parse(props.location.search);
  const [chatVisible, setChatVisible] = React.useState(Boolean(chat));
  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();
  const [loginModalVisible, setLoginModalVisible] = React.useState(false);
  const formRef = React.createRef();

  React.useEffect(() => {
    const sub$ = getDeepLinkedTask$(token)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(task => {
        setLoginModalVisible(true);
        setTask(task);
      });
    return () => sub$.unsubscribe()
  }, []);

  const handleSubmit = () => {
    formRef.current.submit();
  }

  const handleReset = () => {
    formRef.current.resetFields();
  }

  const handleLogin = () => {
    setLoginModalVisible(true);
    // if (role === 'guest') {
    //   // Set password and login
    // } else if (role === 'client') {
    //   // Login
    // }
  }

  const isClientUser = task?.client.role === 'client';

  return (<LayoutStyled>
    <Layout.Header style={{ zIndex: 1, width: '100%', padding: 0 }}>
      <Alert banner
        closable={false}
        type="info"
        showIcon
        icon={<Icon component={() => <Logo size={48} />} />}
        message={<>Welcome to ZeeWorkflow</>}
        description={<>Log in or sign up to have better experience</>}
        action={<Button type="primary" onClick={handleLogin}>Log in</Button>}
      />
    </Layout.Header>
    <ContainerStyled>
      {loading && <Skeleton active />}
      <Modal
        closable={false}
        maskClosable={false}
        destroyOnClose
        title={<Space align="center"><Logo size={28} /> {isClientUser ? "Log In" : "Sign Up"}</Space>}
        visible={loginModalVisible}
        onOk={() => setLoginModalVisible(false)}
        onCancel={() => setLoginModalVisible(false)}
        footer={null}
        width={400}
      >
        {isClientUser ?
          <>
            <Paragraph>It appears this task belongs to an existing account. Please login and continue to have better experience.</Paragraph>
            <LogInPanel email={task?.client.email} />
          </>
          :
          <>
            <Paragraph>Organazation <strong>{task?.client.orgName}</strong> invite you to join ZeeWorkflow to complete this task. Please click below button to set a password and sign in ZeeWorkflow.</Paragraph>
            <ForgotPasswordPanel email={task?.client.email} onFinish={() => setLoginModalVisible(false)} returnUrl={`/task/${task?.id}`} />
          </>
        }
        {/* <Button block type="link" onClick={() => setLoginModalVisible(false)}>Continue as anonymous user</Button> */}
      </Modal>
    </ContainerStyled>

  </LayoutStyled>
  );
};

TaskDirectPage.propTypes = {
  // id: PropTypes.string.isRequired
  loading: PropTypes.bool.isRequired,
};

TaskDirectPage.defaultProps = {
  loading: true,
  // taskId: 'new'
};

export default withRouter(TaskDirectPage);
