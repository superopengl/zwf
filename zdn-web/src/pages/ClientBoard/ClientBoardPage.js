import { PlusOutlined } from '@ant-design/icons';
import { Button, Layout, Row, Col, Space, Spin, Typography, List } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { saveTask, searchTask$ } from '../../services/taskService';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { TaskDraggableCard } from '../../components/TaskDraggableCard';
import { Loading } from 'components/Loading';
import { TaskCard } from 'components/TaskCard';

const { Title } = Typography;

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
`;


const DEFAULT_QUERY_INFO = {
  text: '',
  page: 1,
  size: 200,
  total: 0,
  status: ['todo', 'review', 'held', 'to_sign', 'signed', 'complete'],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};

const AdminBoardPage = () => {
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
      <List
        loading={loading}
        dataSource={list}
        grid={{
          gutter: 24,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 2,
          xl: 3,
          xxl: 3,
        }}
        renderItem={item => <List.Item>
          <TaskCard task={item} />
          </List.Item>}
      />
    </LayoutStyled>
  )
}

AdminBoardPage.propTypes = {};

AdminBoardPage.defaultProps = {};

export default withRouter(AdminBoardPage);