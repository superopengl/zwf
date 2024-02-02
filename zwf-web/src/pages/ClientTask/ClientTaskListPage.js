import { ArrowDownOutlined, ArrowUpOutlined, DownOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Layout, Row, Col, Space, Spin, Typography, List, Tabs, Grid, Alert, Badge, Tooltip, PageHeader, Select, Input } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { saveTask, listClientTask$ } from '../../services/taskService';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { TaskDraggableCard } from '../../components/TaskDraggableCard';
import { Loading } from 'components/Loading';
import { TaskClientCard } from 'components/TaskClientCard';
import DropdownMenu from 'components/DropdownMenu';
import { uniq } from 'lodash';

const { Title, Paragraph, Link: TextLink } = Typography;
const { useBreakpoint } = Grid;


const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
  max-width: 1500px;

  .ant-tabs-tab-btn {
    width: 100%;
  }

  // .ant-tabs-tab {
  //   margin: 0 !important;
  // }
  .ant-page-header-heading {
    padding: 0 0 24px 24px;
  }
`;

const TAB_DEFS = [
  {
    label: 'Action required',
    default: true,
    badgeColor: null,
    alertType: 'warning',
    description: 'These cases requires your actions by either filling the form, upload required files, or reply messages from the agents',
    filter: item => item.status === 'action_required'
  },
  {
    label: 'In progress',
    description: 'These are the cases that are being proceeded by your agents. No immidiate action is required from your side at the moment.',
    badgeColor: '#37AFD2',
    filter: item => {
      return item.status === 'in_progress'
    }
  },
  {
    label: 'Recently completed',
    description: 'The cases that have been completed in the past 30 days.',
    badgeColor: '#66c18c',
    filter: item => {
      return item.status === 'done'
    }
  },
  {
    label: 'Cases done',
    description: 'All the past cases that are either completed successfully or cancelled for some reasons.',
    badgeColor: '#cccccc',
    filter: item => item.status === 'done' || item.status === 'archived',
  },
  {
    label: 'All cases',
    description: 'All the cases, including not started cases, all past cases and all ongoing cases.',
    badgeColor: '#cccccc',
    filter: item => true,
  },
];


export const ClientTaskListPage = withRouter(() => {
  const [loading, setLoading] = React.useState(true);
  const [allList, setAllList] = React.useState([]);
  const [filteredList, setFilteredList] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [org, setOrg] = React.useState('');
  const [order, setOrder] = React.useState('');
  const [activeTab, setActiveTab] = React.useState(TAB_DEFS.find(x => x.default)?.label);
  const screens = useBreakpoint();

  React.useEffect(() => {
    const sub$ = listClientTask$()
      .subscribe(data => {
        setAllList(data);
        setLoading(false);
      });

    return () => sub$.unsubscribe()
  }, []);

  React.useEffect(() => {
    const result = allList.filter(x => !searchText || x.name.toLowerCase().includes(searchText.toLowerCase()))
    .filter(x => !org || x.orgName === org)
    setFilteredList(result);
  }, [allList, searchText, org, order]);

  const sortOptions = React.useMemo(() => [
    {
      value: '+createdAt',
      label: <>Created <ArrowUpOutlined /></>,
    },
    {
      value: '-createdAt',
      label: <>Created <ArrowDownOutlined /></>,
    }
  ], []);

  const orgOptions = React.useMemo(() => {
    const options = uniq(allList.map(x => x.orgName)).map(x => ({
      value: x,
      label: x,
    }));
    options.unshift({ value: '', label: 'All organizations' })
    return options;
  }, [allList]);

  return (
    <LayoutStyled>
      <PageHeader
        title="All Cases"
        backIcon={false}
        extra={[
          <Input.Search key="search" placeholder='Search text' style={{ width: 200 }}
            onSearch={setSearchText}
            maxLength={200}
            allowClear />,
          <Select key="org" options={orgOptions} defaultValue={''} dropdownMatchSelectWidth={false} style={{ width: 200 }} />,
          <Select key="sort" options={sortOptions} dropdownMatchSelectWidth={false} style={{ width: 120 }} />,
        ]}
      >
        <Tabs tabPosition={screens.md ? 'left' : 'top'}
          size="small"
          type="line"
          onChange={setActiveTab}
          defaultActiveKey={activeTab}>
          {TAB_DEFS.map(tab => {
            const count = allList.filter(tab.filter).length;
            const data = filteredList.filter(tab.filter);
            return <Tabs.TabPane
              tab={<Tooltip title={tab.description} placement={screens.md ? "leftTop" : 'bottom'} mouseEnterDelay={1}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  {tab.label}
                  <Badge showZero={false} count={count} style={{ backgroundColor: tab.badgeColor }} />
                </Space>
              </Tooltip>}
              key={tab.label}>
              <Alert description={tab.description}
                type={tab.alertType || "info"}
                showIcon
                style={{ marginBottom: 20 }}
              />
              <List
                loading={loading}
                dataSource={data}
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
                  <TaskClientCard task={item} searchText={searchText}/>
                </List.Item>}
              />
            </Tabs.TabPane>
          })}
        </Tabs>
      </PageHeader>
    </LayoutStyled>
  )
})

ClientTaskListPage.propTypes = {};

ClientTaskListPage.defaultProps = {};
