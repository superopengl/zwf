import { PlusOutlined } from '@ant-design/icons';
import { Button, Layout, Row, Col, Space, Spin, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { saveTask, searchTask$ } from '../../services/taskService';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import {TaskDraggableCard} from '../../components/TaskDraggableCard';
import { Loading } from 'components/Loading';
import { TaskCard } from 'components/TaskCard';

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
  status: ['todo', 'review', 'held', 'to_sign', 'signed', 'complete'],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};

const AdminBoardPage = props => {
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [queryInfo] = React.useState(DEFAULT_QUERY_INFO)
  const loadSignalRef = React.useRef(0);


  React.useEffect(() => {
    const sub$ = searchTask$(queryInfo)
      .subscribe(resp => {
        const { data } = resp;
        setList(data);
        setLoading(false);
      });

    return () => {
      sub$.unsubscribe();
    }
  }, [loadSignalRef]);

  return (
    <LayoutStyled>
      <Loading loading={loading}>
        {/* {list?.map((task, index) => <TaskCard key={task.id} index={index} task={task} onChange={() => loadSignalRef.current++} />)} */}
        {list?.map((task, index) => <TaskCard task={task} />)}
      </Loading>
    </LayoutStyled>
  )
}

AdminBoardPage.propTypes = {};

AdminBoardPage.defaultProps = {};

export default withRouter(AdminBoardPage);