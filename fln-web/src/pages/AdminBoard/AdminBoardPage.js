import { PlusOutlined } from '@ant-design/icons';
import { Button, Layout, Row, Col, Space, Spin, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';

import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { saveTask, searchTask } from '../../services/taskService';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import TaskCard from '../../components/TaskCard';
import { Loading } from 'components/Loading';

const { Title } = Typography;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
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
    status: 'to_sign',
    label: 'To Sign',
    bgColor: '#f5f5f5',
    hoverColor: '#ff4d4f',
  },
  {
    status: 'signed',
    label: 'Signed',
    bgColor: '#f5f5f5',
    hoverColor: '#1890ff',
  },
  {
    status: 'complete',
    label: 'Completed',
    bgColor: '#f5f5f5',
    hoverColor: '#73d13d',
  },
]

const DEFAULT_QUERY_INFO = {
  text: '',
  page: 1,
  size: 200,
  total: 0,
  status: ['todo', 'to_sign', 'signed', 'complete'],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};

const AdminBoardPage = props => {
  const [loading, setLoading] = React.useState(true);
  const [taskList, setTaskList] = React.useState([]);
  const [queryInfo] = React.useState(DEFAULT_QUERY_INFO)

  const loadList = async () => {
    setLoading(true);
    const { data } = await searchTask(queryInfo);
    setTaskList(data);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const onDragEnd = async result => {
    const { draggableId: taskId, destination: { droppableId: status } } = result;
    const task = taskList.find(j => j.id === taskId);
    if (task.status !== status) {
      task.status = status;
      setLoading(true);
      try {
        await saveTask(task);
      } finally {
        await loadList();
        setLoading(false);
      }
    }
  }

  const handleCreateTask = () => {
    props.history.push('/tasks/new');
  }
  return (
    <LayoutStyled>
      
      <ContainerStyled>
        <Space style={{ width: '100%', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Link to="/tasks"><Button type="link">All Tasks</Button></Link>
          <Button type="primary" onClick={() => handleCreateTask()} icon={<PlusOutlined />}>New Task</Button>
        </Space>
        <DragDropContext onDragEnd={onDragEnd}>
          <Loading loading={loading}>
            <StyledRow gutter={10}>
              {COLUMN_DEFS.map((s, i) => <Droppable droppableId={s.status} key={i}>
                {(provided, snapshot) => (
                  <Col span={6}
                    ref={provided.innerRef}>
                    <StyledColumn direction="vertical" style={{ backgroundColor: s.bgColor, border: `2px dashed ${snapshot.isDraggingOver ? s.hoverColor : s.bgColor}` }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Title level={5} style={{ textAlign: 'center', margin: '0 auto' }} type="secondary">{s.label}</Title>
                        <Text strong>{taskList.filter(j => j.status === s.status).length}</Text>
                      </Space>
                      {taskList.filter(j => j.status === s.status).map((task, index) => {
                        // if (task.statusId === status.id)
                        return (
                          <TaskCard key={task.id} index={index} task={task} onChange={() => loadList()} />
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
      </ContainerStyled>
    </LayoutStyled>
  )
}

AdminBoardPage.propTypes = {};

AdminBoardPage.defaultProps = {};

export default withRouter(AdminBoardPage);