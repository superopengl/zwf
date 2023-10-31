import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Space, Button, Alert } from 'antd';

import { getDeepLinkedTask$, getTask, saveDeepLinkedTask$ } from 'services/taskService';
import MyTaskSign from './MyTaskSign';
import TaskFormWizard from './TaskFormWizard';
import MyTaskReadView from './MyTaskReadView';
import * as queryString from 'query-string';
import { MessageFilled } from '@ant-design/icons';
import { TaskStatus } from 'components/TaskStatus';
import { Loading } from 'components/Loading';
import { catchError } from 'rxjs/operators';
import { TaskFormPanel } from './TaskFormPanel';
import { Logo } from 'components/Logo';
import Icon from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import PropTypes from 'prop-types';


const LayoutStyled = styled(Layout)`
margin: 0 auto 0 auto;
background-color: #ffffff;
height: 100%;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 1000px;
  background-color: #ffffff;
  height: 100%;
`;

const TaskDirectPage = (props) => {
  const id = props.match.params.id;

  const { chat, portfolioId } = queryString.parse(props.location.search);
  const [chatVisible, setChatVisible] = React.useState(Boolean(chat));
  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();
  const formRef = React.createRef();

  React.useEffect(() => {
    const subscription$ = getDeepLinkedTask$(id)
      .pipe(
        catchError(() => setLoading(false))
      )
      .subscribe(task => {
        setTask(task);
        setLoading(false);
      });
    return () => {
      subscription$.unsubscribe();
    }
  }, [])

  const onOk = () => {
    props.history.push('/tasks');
  }
  const onCancel = () => {
    props.history.goBack();
  }

  const handleSave = values => {
    getDeepLinkedTask$(id)
      .pipe(
        catchError(() => setLoading(false))
      )
      .subscribe(task => {
        saveDeepLinkedTask$(task);
        setLoading(false);
      });
  }

  const handleSubmit = () => {
    formRef.current.submit();
  }

  const handleReset = () => {
    formRef.current.resetFields();
  }

  return (<LayoutStyled>
    <Alert banner
      closable={false}
      type="info"
      showIcon
      icon={<Icon component={() => <Logo size={48} />} />}
      message={<>Welcome to Ziledin</>}
      description={<>Log in or sign up to have better experience</>}
      action={<Button type="primary">Log in</Button>}
    />
    <ContainerStyled>
    <PageContainer
        loading={loading}
        header={{
          title: task?.name || 'Loading'
        }}
        // content={<Paragraph type="secondary">{value.description}</Paragraph>}
        extra={[
          <Button key="reset" onClick={handleReset}>Reset</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Submit</Button>
        ]}
        footer={[
          <Button key="reset" onClick={handleReset}>Reset</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Submit</Button>
        ]}
      >
      <TaskFormPanel ref={formRef} value={task} type="client" onSave={handleSave} />
      </PageContainer>
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
