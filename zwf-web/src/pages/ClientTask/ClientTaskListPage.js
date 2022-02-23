import { PlusOutlined } from '@ant-design/icons';
import { Button, Layout, Row, Col, Space, Spin, Typography, List } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { saveTask, listTask$ } from '../../services/taskService';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { TaskDraggableCard } from '../../components/TaskDraggableCard';
import { Loading } from 'components/Loading';
import { TaskClientCard } from 'components/TaskClientCard';

const { Title } = Typography;

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
`;


export const ClientTaskListPage = withRouter(() => {
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    const sub$ = listTask$()
      .subscribe(data => {
        setList(data);
        setLoading(false);
      });

    return () => sub$.unsubscribe()
  }, []);

  return (
    <LayoutStyled>
      <List
        loading={loading}
        dataSource={list}
        grid={{
          gutter: 24,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 1,
          xl: 2,
          xxl: 3,
        }}
        renderItem={item => <List.Item>
          <TaskClientCard task={item} />
        </List.Item>}
      />
    </LayoutStyled>
  )
})

ClientTaskListPage.propTypes = {};

ClientTaskListPage.defaultProps = {};
