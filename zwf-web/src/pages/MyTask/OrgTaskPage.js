import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Skeleton } from 'antd';

import { changeTaskStatus$, getTask$, updateTaskTags$ } from 'services/taskService';
import * as queryString from 'query-string';
import { PageContainer } from '@ant-design/pro-layout';
import { TaskWorkPanel } from 'components/TaskWorkPanel';
import { catchError, switchMapTo } from 'rxjs/operators';
import { TaskStatusButton } from 'components/TaskStatusButton';
import { TaskTagSelect } from 'components/TaskTagSelect';
import { combineLatest } from 'rxjs';
import { listTaskTags$ } from 'services/taskTagService';
import Tag from 'components/Tag';
import TagSelect from 'components/TagSelect';
import { GlobalContext } from 'contexts/GlobalContext';

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


const OrgTaskPage = React.memo((props) => {
  const id = props.match.params.id;

  const { chat } = queryString.parse(props.location.search);
  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();

  const formRef = React.createRef();

  React.useEffect(() => {
    const subscription$ = getTask$(id).pipe(
      catchError(() => setLoading(false))
    )
      .subscribe((taskInfo) => {
        const { email, role, userId, orgId, orgName, ...task } = taskInfo;
        setTask(task);
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

  return (<>
    <ContainerStyled>
      {task && <PageContainer
        loading={loading}
        onBack={handleGoBack}
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
        <TaskTagSelect value={task.tags.map(t => t.id)} onChange={handleTagsChange} />
        <TaskWorkPanel ref={formRef} task={task} type="agent" />
      </PageContainer>}
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
