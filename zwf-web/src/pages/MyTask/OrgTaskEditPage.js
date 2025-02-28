import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Skeleton, Button } from 'antd';
import { getTask$, renameTask$, updateTaskFields$ } from 'services/taskService';
import { catchError, finalize } from 'rxjs/operators';
import { TaskIcon } from 'components/entityIcon';
import { SavingAffix } from 'components/SavingAffix';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { useAssertRole } from 'hooks/useAssertRole';
import TaskFieldEditorPanel from 'pages/TaskTemplate/TaskFieldEditorPanel';


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

.ant-collapse-item {
  .ant-collapse-content-box, .ant-collapse-header {
    padding-left:0;
    padding-right:0;
  }
}
`;


const OrgTaskEditPage = React.memo(() => {
  useAssertRole(['admin', 'agent'])
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = React.useState(true);
  const [taskName, setTaskName] = React.useState('');
  const [fields, setFields] = React.useState([]);
  const [saving, setSaving] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe()
  }, [id]);

  React.useEffect(() => {
    setSaving(true);
    const sub$ = updateTaskFields$(id, fields).pipe(
      finalize(() => setSaving(false))
    ).subscribe();
    return () => sub$.unsubscribe()
  }, [fields]);

  const load$ = () => {
    setLoading(true);
    return getTask$(id).pipe(
      finalize(() => setLoading(false))
    ).subscribe(task => {
      setTaskName(task.name);
      setFields(task.fields);
    });
  }

  const handleGoBack = () => {
    navigate(`/task/${id}`);
  }

  const handleTaskFieldsChange = fields => {
    setFields(fields);
  }

  return (<>
    <ContainerStyled>
      <PageHeaderContainer
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
            path: `/task/${id}`,
            name: taskName
          },
          {
            name: 'Edit Fields'
          }
        ]}
        // fixedHeader
        title={taskName ? <>{taskName}</> : <Skeleton paragraph={false} />}
        icon={<TaskIcon />}
        // content={<Paragraph type="secondary">{value.description}</Paragraph>}
        extra={[
          <Button key="done" type="primary" onClick={handleGoBack}>Done</Button>
          // <Button key="save" icon={<SaveOutlined />} onClick={handleSaveForm}>Save <Form></Form></Button>,
        ]}
      >
        <TaskFieldEditorPanel fields={fields} onChange={handleTaskFieldsChange} />

      </PageHeaderContainer>
      {saving && <SavingAffix />}
    </ContainerStyled>
  </>
  );
});

OrgTaskEditPage.propTypes = {
  // id: PropTypes.string.isRequired
};

OrgTaskEditPage.defaultProps = {
  // taskId: 'new'
};

export default OrgTaskEditPage;
