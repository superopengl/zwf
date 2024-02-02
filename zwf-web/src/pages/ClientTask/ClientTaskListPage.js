import { PlusOutlined } from '@ant-design/icons';
import { Button, Layout, Row, Col, Space, Spin, Typography, List, Tabs, Grid, Alert } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { saveTask, listTask$ } from '../../services/taskService';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { TaskDraggableCard } from '../../components/TaskDraggableCard';
import { Loading } from 'components/Loading';
import { TaskClientCard } from 'components/TaskClientCard';

const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;


const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
  max-width: 1500px;
`;

const TAB_DEFS = [
  {
    label: 'Action required',
    default: true,
    description: 'These tasks requires your actions by either filling the form, upload required files, or reply messages from the agents',
    filter: item => {
      return true;
    }
  },
  {
    label: 'In progress',
    description: 'These are the tasks that are being proceeded by your agents. No immidiate action is required from your side at the moment.',
    filter: item => {
      return true;
    }
  },
  {
    label: 'Recently completed (30 days)',
    description: 'The tasks that have been completed in the past 30 days.',
    filter: item => {
      return true;
    }
  },
  {
    label: 'Past tasks',
    description: 'All the past tasks that are either completed or archived.',
    filter: item => {
      return true;
    }
  },
  {
    label: 'All tasks',
    description: 'All the tasks.',
    filter: item => {
      return true;
    }
  },
];


export const ClientTaskListPage = withRouter(() => {
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const screens = useBreakpoint();

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
      <Tabs tabPosition={screens.md ? 'left' : 'top'}
       type="line"
        defaultActiveKey={TAB_DEFS.find(x => x.default)?.label}>
        {TAB_DEFS.map(tab => <Tabs.TabPane tab={tab.label} key={tab.label}>
          <Alert description={tab.description} type="info" showIcon style={{marginBottom: 20}}/>
          <List
            loading={loading}
            dataSource={list.filter(tab.filter)}
            grid={{
              gutter: 24,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 1,
              xl: 2,
              xxl: 2,
            }}
            renderItem={item => <List.Item>
              <TaskClientCard task={item} />
            </List.Item>}
          />
        </Tabs.TabPane>)}
      </Tabs>
    </LayoutStyled>
  )
})

ClientTaskListPage.propTypes = {};

ClientTaskListPage.defaultProps = {};
