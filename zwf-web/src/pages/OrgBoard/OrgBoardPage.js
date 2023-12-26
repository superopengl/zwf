import { PlusOutlined } from '@ant-design/icons';
import { Button, Row, Col, Space, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { changeTaskStatus$, searchTask$ } from '../../services/taskService';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { TaskDraggableCard } from '../../components/TaskDraggableCard';
import { Loading } from 'components/Loading';
import { switchMap } from 'rxjs/operators';

const { Title } = Typography;

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
`;

const ContainerStyled = styled.div`
  margin: 6rem 1rem 2rem 1rem;
`;

const StyledRow = styled(Row)`
  height: 100%;
  min-height: calc(100vh - 180px);
`;

const StyledColumn = styled(Space)`
border-radius: 4px;
background-color: rgb(250,250,250);
height: 100%;
width: 100%;
padding: 8px;
`;

const COLUMN_DEFS = [
  {
    status: 'todo',
    label: 'To Do',
    bgColor: '#f5f5f5',
    hoverColor: '#bfbfbf',
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    bgColor: '#1890ff11',
    hoverColor: '#1890ff',
  },
  {
    status: 'pending_fix',
    label: 'Await client reply',
    bgColor: '#06117811',
    hoverColor: '#061178',
  },
  {
    status: 'pending_sign',
    label: 'Await client sign',
    bgColor: '#f5222d11',
    hoverColor: '#f5222d',
  },
  {
    status: 'signed',
    label: 'Signed',
    bgColor: '#5c001111',
    hoverColor: '#5c0011',
  },
  {
    status: 'done',
    label: 'Done',
    bgColor: '#52c41a11',
    hoverColor: '#52c41a',
  },
]

const DEFAULT_QUERY_INFO = {
  text: '',
  page: 1,
  size: 200,
  total: 0,
  status: ['todo', 'in_progress', 'pending_fix', 'pending_sign', 'signed', 'done'],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};

const OrgBoardPage = props => {
  const [loading, setLoading] = React.useState(true);
  const [taskList, setTaskList] = React.useState([]);
  const [queryInfo] = React.useState(DEFAULT_QUERY_INFO)



  React.useEffect(() => {
    const subscription = searchTask$(queryInfo).subscribe(list => {
      setTaskList(list.data);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    }
  }, []);

  const loadList = () => {
    setLoading(true);
    searchTask$(queryInfo).subscribe(list => {
      setTaskList(list.data);
      setLoading(false);
    });
  }

  const onDragEnd = async result => {
    const { draggableId: taskId, destination: { droppableId: status } } = result;
    const task = taskList.find(j => j.id === taskId);
    if (task.status !== status) {
      task.status = status;
      setLoading(true);
      changeTaskStatus$(task.id, status)
        .pipe(
          switchMap(() => searchTask$(queryInfo))
        )
        .subscribe(list => {
          setTaskList(list.data);
          setLoading(false);
        });
    }
  }

  const handleCreateTask = () => {
    props.history.push('/task/new');
  }
  return (
    <LayoutStyled>
      <Space style={{ width: '100%', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Link to="/task"><Button type="link">All Tasks</Button></Link>
        <Button type="primary" onClick={() => handleCreateTask()} icon={<PlusOutlined />}>New Task</Button>
      </Space>
      <DragDropContext onDragEnd={onDragEnd}>
        <Loading loading={loading}>
          <StyledRow gutter={10}>
            {COLUMN_DEFS.map((s, i) => <Droppable droppableId={s.status} key={i}>
              {(provided, snapshot) => (
                <Col span={4}
                  ref={provided.innerRef}>
                  <StyledColumn direction="vertical" style={{
                    backgroundColor: s.bgColor,
                    borderWidth: 2,
                    borderStyle: `${snapshot.isDraggingOver ? 'dashed' : 'solid'}`,
                    borderColor: `${snapshot.isDraggingOver ? s.hoverColor : s.bgColor}`
                  }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Title level={5} style={{ textAlign: 'center', margin: '0 auto' }} type="secondary">{s.label}</Title>
                      <Text strong>{taskList.filter(j => j.status === s.status).length}</Text>
                    </Space>
                    {taskList.filter(j => j.status === s.status).map((task, index) => {
                      // if (task.statusId === status.id)
                      return (
                        <TaskDraggableCard key={task.id} index={index} task={task} onChange={() => loadList()} />
                      );
                    })
                    }
                    {provided.placeholder}
                  </StyledColumn>
                </Col>
              )}
            </Droppable>)}
          </StyledRow>
        </Loading>
      </DragDropContext>
    </LayoutStyled>
  )
}

OrgBoardPage.propTypes = {};

OrgBoardPage.defaultProps = {};

export default withRouter(OrgBoardPage);