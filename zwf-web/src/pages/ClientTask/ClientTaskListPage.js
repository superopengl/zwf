import { ArrowDownOutlined, ArrowUpOutlined, ClearOutlined, DownOutlined, PlusOutlined, SyncOutlined, UpOutlined } from '@ant-design/icons';
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
import { orderBy, uniq } from 'lodash';
import { GrAscend, GrDescend } from 'react-icons/gr';
import { useLocalStorage } from 'react-use';
import { ImSortAmountAsc, ImSortAmountDesc } from 'react-icons/im';
import Icon from '@ant-design/icons';

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
    badgeColor: '#66c18c',
    label: 'Completed',
    description: 'The cases that have been completed.',
    filter: item => {
      return item.status === 'done'
    }
  },
  {
    label: 'All cases',
    badgeColor: '#bbbbbb',
    description: 'All the cases, including all completed cases, in progress cases, and action required cases.',
    filter: item => true,
  },
];

const TASK_FILTER_KEY = 'client.tasks.filter';
const TASK_FILTER_DEFAULT = {
  text: '',
  org: '',
  order: '-updatedAt',
  tab: 'Action required',
};

export const ClientTaskListPage = withRouter(() => {
  const [loading, setLoading] = React.useState(true);
  const [allList, setAllList] = React.useState([]);
  const [filteredList, setFilteredList] = React.useState([]);
  const [searchText, setSearchText] = React.useState();
  const [query, setQuery] = useLocalStorage(TASK_FILTER_KEY, TASK_FILTER_DEFAULT);
  const screens = useBreakpoint();

  const load$ = () => {
    setLoading(true);
    return listClientTask$()
    .subscribe(data => {
      setAllList(data);
      setLoading(false);
    });
  }

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe()
  }, []);

  React.useEffect(() => {
    setSearchText(query.text);
  }, [query]);

  React.useEffect(() => {
    const { text, org, order } = query;
    let result = allList;
    if (text) {
      result = result.filter(x => x.name.toLowerCase().includes(text))
    }
    if (org) {
      result = result.filter(x => !org || x.orgName === org)
    }
    if (order) {
      const direction = order[0] === '+' ? 'asc' : 'desc';
      const field = order.substring(1);
      result = orderBy(result, [field], [direction]);
    }
    setFilteredList(result);
  }, [allList, query]);

  const sortOptions = React.useMemo(() => [
    {
      value: '-updatedAt',
      label: <Space style={{ width: '100%', justifyContent: 'space-between' }}>Updated (newest)<Icon component={() => <ImSortAmountDesc />} /></Space>,
    },
    {
      value: '+updatedAt',
      label: <Space style={{ width: '100%', justifyContent: 'space-between' }}>Updated (oldest)<Icon component={() => <ImSortAmountAsc />} /></Space>,
    },
    {
      value: '-createdAt',
      label: <Space style={{ width: '100%', justifyContent: 'space-between' }}>Created (newest)<Icon component={() => <ImSortAmountDesc />} /></Space>,
    },
    {
      value: '+createdAt',
      label: <Space style={{ width: '100%', justifyContent: 'space-between' }}>Created (oldest)<Icon component={() => <ImSortAmountAsc />} /></Space>,
    },

  ], []);

  const orgOptions = React.useMemo(() => {
    const options = uniq(allList.map(x => x.orgName)).map(x => ({
      value: x,
      label: x,
    }));
    options.unshift({ value: '', label: '(All organisations)' })
    return options;
  }, [allList]);

  return (
    <LayoutStyled>
      <PageHeader
        title="All Cases"
        backIcon={false}
        loading={loading}
        extra={[
          <Button key="refresh"
          icon={<SyncOutlined />}
          onClick={() => load$()}
          type="link">Refresh</Button>,
          <Button key="clear"
            icon={<ClearOutlined />}
            onClick={() => setQuery({ ...TASK_FILTER_DEFAULT, tab: query.tab })}
            type="link">Reset filters</Button>,
          <Input.Search
            key="search"
            placeholder='Search text'
            style={{ width: 200 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onSearch={text => setQuery({ ...query, text: text.toLowerCase() })}
            maxLength={200}
            allowClear />,
          <Select key="org"
            options={orgOptions}
            value={query.org}
            onSelect={org => setQuery({ ...query, org })}
            dropdownMatchSelectWidth={false}
            style={{ width: 200 }} />,
          <Select key="sort"
            value={query.order}
            options={sortOptions}
            onSelect={order => setQuery({ ...query, order })}
            dropdownMatchSelectWidth={false}
            style={{ width: 200 }} />,
        ]}
      >
        <Tabs tabPosition={screens.md ? 'left' : 'top'}
          size="small"
          type="line"
          // animated={{inkBar: true, tabPane: true}}
          onChange={tab => setQuery({ ...query, tab })}
          defaultActiveKey={query.tab}>
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
                  <TaskClientCard task={item} searchText={query.text} />
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
