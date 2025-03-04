import { ClearOutlined, RightOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Space, Typography, Row, Col, Tabs, Grid, Alert, Badge, Tooltip, Select, Input, Card, Tag, Checkbox, ConfigProvider } from 'antd';
import React from 'react';
import { PageContainer } from '@ant-design/pro-components';

import { listClientTask$ } from '../../services/taskService';
import styled from 'styled-components';
import { TaskClientCard } from 'components/TaskClientCard';
import { orderBy, uniq } from 'lodash';
import { useLocalstorageState } from 'rooks';
import { ImSortAmountAsc, ImSortAmountDesc } from 'react-icons/im';
import Icon from '@ant-design/icons';
import { useAssertRole } from 'hooks/useAssertRole';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { ProList } from '@ant-design/pro-components';
import { useNavigate } from 'react-router-dom';
import { TaskIcon } from 'components/entityIcon';
import { Descriptions } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import { HighlightingText } from 'components/HighlightingText';
import CheckboxButton from 'components/CheckboxButton';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { BiRightArrow } from 'react-icons/bi';

const { useBreakpoint } = Grid;
const { CheckableTag } = Tag;
const { Paragraph } = Typography;

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // margin-left: -16px;
  // background-color: #ffffff;
  height: 100%;
  max-width: 1200px;

  .ant-tabs-tab-btn {
    width: 100%;
  }


`;


const CLIENT_TASK_FILTER_KEY = 'client.tasks.filter';
const TASK_FILTER_DEFAULT = {
  text: '',
  org: '',
  order: '-updatedAt',
  status: ['in_progress', 'action-required', 'done'],
};


export const ClientTaskListPage = () => {
  useAssertRole(['client']);
  const [loading, setLoading] = React.useState(true);
  const [allList, setAllList] = React.useState([]);
  const [filteredList, setFilteredList] = React.useState([]);
  const [searchText, setSearchText] = React.useState();
  const [query, setQuery] = useLocalstorageState(CLIENT_TASK_FILTER_KEY, TASK_FILTER_DEFAULT);
  const navigate = useNavigate();

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

    const formatted = result.map(item => ({
      id: item.id,
      data: item,
      title: <HighlightingText value={item.name} search={query.text} />,
      subTitle: <>by {item.orgName}</>,
      avatar: <TaskIcon />,
      description: <>
        <Descriptions size="small" column={2}>
          <Descriptions.Item label="created">
            <TimeAgo value={item.createdAt} showTime={false} direction="horizontal" />
          </Descriptions.Item>
          <Descriptions.Item label="updated">
            <TimeAgo value={item.updatedAt} showTime={false} direction="horizontal" />
          </Descriptions.Item>
        </Descriptions>
      </>,
      extra: {
        render: () => <Tag>blah</Tag>
      }
    }))
    setFilteredList(formatted);
  }, [allList, query]);

  const handleToggleStatus = (status) => {
    let queryStatus = query.status ?? [];
    if (isFilteringStatus(status)) {
      queryStatus = queryStatus.filter(s => s !== status);
    } else {
      queryStatus.push(status);
    }
    setQuery(q => ({ ...q, status: queryStatus }));
  }

  const isFilteringStatus = (status) => {
    return query.status?.includes(status);
  }

  const sortOptions = React.useMemo(() => [
    {
      value: '-updatedAt',
      label: <Space style={{ width: '100%', justifyContent: 'space-between' }}>Updated (newest)<Icon component={ImSortAmountDesc} /></Space>,
    },
    {
      value: '+updatedAt',
      label: <Space style={{ width: '100%', justifyContent: 'space-between' }}>Updated (oldest)<Icon component={ImSortAmountAsc} /></Space>,
    },
    {
      value: '-createdAt',
      label: <Space style={{ width: '100%', justifyContent: 'space-between' }}>Created (newest)<Icon component={ImSortAmountDesc} /></Space>,
    },
    {
      value: '+createdAt',
      label: <Space style={{ width: '100%', justifyContent: 'space-between' }}>Created (oldest)<Icon component={ImSortAmountAsc} /></Space>,
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
      <PageHeaderContainer
        loading={loading}
        title='All My Cases'
        extra={[

        ]}
      >
        <Row gutter={[12, 24]}>
          <Col>
            <CheckboxButton value={isFilteringStatus('in_progress')} onChange={() => handleToggleStatus('in_progress')}>Pending</CheckboxButton>
          </Col>
          <Col>
            <CheckboxButton danger value={isFilteringStatus('action_required')} onChange={() => handleToggleStatus('action_required')}>Action Required</CheckboxButton>
          </Col>
          <Col>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#00B42A'
                }
              }}
            >
              <CheckboxButton value={isFilteringStatus('done')} type="primary" onChange={() => handleToggleStatus('done')}>Completed</CheckboxButton>
            </ConfigProvider>
          </Col>

          <Col>
            <Input.Search
              key="search"
              placeholder='Search text'
              style={{ width: 200 }}
              value={query.text}
              onChange={e => setQuery({ ...query, text: e.target.value.toLowerCase() })}
              onSearch={text => setQuery({ ...query, text: text.toLowerCase() })}
              maxLength={200}
              allowClear />

          </Col>
          <Col>
            <Select key="org"
              options={orgOptions}
              value={query.org}
              onSelect={org => setQuery({ ...query, org })}
              dropdownMatchSelectWidth={false}
              style={{ width: 200 }} />
          </Col>
          <Col>
            <Select key="sort"
              value={query.order}
              options={sortOptions}
              onSelect={order => setQuery({ ...query, order })}
              dropdownMatchSelectWidth={false}
              style={{ width: 200 }} />
          </Col>
          <Col>
            <Button key="clear"
              icon={<ClearOutlined />}
              onClick={() => setQuery({ ...TASK_FILTER_DEFAULT })}
              type="link"
            >Reset filters</Button>
          </Col>
        </Row>
        <ProList
          headerTitle=" "
          grid={{
            gutter: [24, 24],
            xs: 1,
            sm: 1,
            md: 1,
            lg: 1,
            xl: 1,
            xxl: 1
          }}
          ghost
          dataSource={filteredList}
          loading={loading}
          locale={{
            emptyText: <div style={{ margin: '30px auto' }}>
              <Paragraph type="secondary">
                There is no active cases now.
              </Paragraph>
            </div>
          }}
          onItem={(item) => {
            return {
              onMouseEnter: () => {
              },
              onClick: () => {
                navigate(`/task/${item.id}`);
              },
            };
          }}
          toolBarRender={() => {
            return [
              <Button key="refresh" icon={<SyncOutlined />} onClick={() => load$()} type="primary" ghost>Refresh</Button>
            ];
          }}
          rowKey="id"
          itemLayout="vertical"
          metas={{
            title: {},
            subTitle: {},
            type: {},
            avatar: {},
            content: {},
            extra: {
              render: () => [
                <div
                  style={{
                    minWidth: 200,
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div
                    style={{
                      width: '200px',
                    }}
                  >
                    <div>发布中</div>
                    {/* <Progress percent={80} /> */}
                  </div>
                </div>
              ],
            },
            actions: {
              render: (_, item) => {
                return [
                <Tag key="status">{item.data.status}</Tag>,
                <Button icon={<RightOutlined/>} type="text"/>
                ];
              },
            },
          }}

        />

        {/* <Tabs tabPosition={screens.md ? 'left' : 'top'}
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
        </Tabs> */}
      </PageHeaderContainer>
    </LayoutStyled>
  )
}

ClientTaskListPage.propTypes = {};

ClientTaskListPage.defaultProps = {};

export default ClientTaskListPage;
