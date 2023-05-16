import { ClearOutlined, SyncOutlined } from '@ant-design/icons';
import { Badge, Tag, Button, Space, Typography, Row, Col, List, Card, Select, Input, ConfigProvider } from 'antd';
import React from 'react';

import { listClientTask$ } from '../../services/taskService';
import styled from 'styled-components';
import { orderBy, uniq } from 'lodash';
import { useLocalstorageState } from 'rooks';
import { ImSortAmountAsc, ImSortAmountDesc } from 'react-icons/im';
import Icon from '@ant-design/icons';
import { useAssertRole } from 'hooks/useAssertRole';
import { useNavigate } from 'react-router-dom';
import { Descriptions } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import { HighlightingText } from 'components/HighlightingText';
import CheckboxButton from 'components/CheckboxButton';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { TaskStatusTag } from 'components/TaskStatusTag';
import { NotificationContext } from 'contexts/NotificationContext';

const { Paragraph, Text } = Typography;

const Container = styled.div`
  margin: 0 auto 0 auto;
  // margin-left: -16px;
  // background-color: #ffffff;
  height: 100%;
  max-width: 1000px;
  width: 100%;

  .ant-tabs-tab-btn {
    width: 100%;
  }
`;

const StyledList = styled(List)`
margin-top: 20px;

.ant-list-item {
  padding: 0;
}
`;


const CLIENT_TASK_FILTER_KEY = 'client.task.filter';
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
  const { zevents } = React.useContext(NotificationContext);

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

    setFilteredList(allList);
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

  const descriptionSpan = {
    xs: 24,
    sm: 12,
    md: 12,
    lg: 12,
    xl: 12,
    xxl: 12
  }

  return (
    <Container>
      <PageHeaderContainer
        loading={loading}
        title='All My Cases'
        extra={[
          // <Button key="refresh" icon={<SyncOutlined />} onClick={() => load$()} >Refresh</Button>
        ]}
      >
        <Row gutter={[20, 20]} style={{ display: 'none' }}>
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
        <StyledList
          grid={{
            gutter: [20, 10],
            xs: 1,
            sm: 1,
            md: 1,
            lg: 2,
            xl: 2,
            xxl: 2
          }}
          dataSource={filteredList}
          loading={loading}
          itemLayout="horizontal"
          locale={{
            emptyText: <div style={{ margin: '30px auto' }}>
              <Paragraph type="secondary">
                There is no active cases now.
              </Paragraph>
            </div>
          }}
          rowKey="id"
          renderItem={item => <List.Item>
            <Card
              title={<><HighlightingText value={item.name} search={query.text} /></>}
              extra={[
                <Tag key="org">{item.orgName}</Tag>,
                <Badge key="count" showZero={false} 
                count={zevents.filter(z => z.payload.taskId === item.id && !z.payload.ackAt).length} 
                offset={[34, -36]}
                />
              ]}
              onClick={() => navigate(`/task/${item.id}`)}
              hoverable
              bordered={false}
            >
              <Row>
                <Col {...descriptionSpan}>
                  <TimeAgo prefix="created" value={item.createdAt} showTime={false} direction="horizontal" />
                </Col>
                <Col {...descriptionSpan}>
                  <TimeAgo prefix="updated" value={item.updatedAt} showTime={false} direction="horizontal" />
                </Col>
              </Row>
            </Card>
          </List.Item>}
        />
      </PageHeaderContainer>
    </Container>
  )
}

ClientTaskListPage.propTypes = {};

ClientTaskListPage.defaultProps = {};

export default ClientTaskListPage;
