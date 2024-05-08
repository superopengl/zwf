import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Input, Card, Select, Space, Row, Col, Drawer, Typography } from 'antd';

import React from 'react';
import styled from 'styled-components';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import { ClientSelect } from 'components/ClientSelect';
import PropTypes from 'prop-types';
import { TagSelect } from 'components/TagSelect';
import { MemberSelect } from 'components/MemberSelect';

const { Text, Paragraph } = Typography;

const span = { xs: 24, sm: 24, md: 12, lg: 8, xl: 6, xxl: 4 };

const ItemCol = props => {
  return <Col {...span}>
    <Paragraph strong>{props.title}</Paragraph>
    {props.children}
  </Col>
}

export const TaskSearchPanel = props => {
  const { queryInfo, onChange } = props;

  const handleTextChange = (value) => {
    const text = value?.trim();
    onChange({ ...queryInfo, text });
  }

  const handleStatusFilter = (status) => {
    onChange({ ...queryInfo, status });
  }

  const handleAssigneeChange = (agentId) => {
    onChange({ ...queryInfo, agentId });
  }

  const handleTaskTemplateIdChange = (taskTemplateId) => {
    onChange({ ...queryInfo, taskTemplateId, });
  }

  const handleClientIdChange = (clientId) => {
    onChange({ ...queryInfo, clientId });
  }

  const handleTagsChange = tags => {
    onChange({ ...queryInfo, tags: tags ?? [], });
  }

  const handleExecuteSearch = () => {
    onChange(queryInfo);
  }

  const StatusSelectOptions = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Action Required', value: 'action_required' },
    { label: 'Done', value: 'done' },
    { label: 'Archived', value: 'archived' },
  ]

  return (
    <>
      <Row gutter={[20, 10]}>
        <ItemCol title="Search text">
          <Input
            style={{ width: '100%' }}
            placeholder="Task name, client name, or client email"
            onPressEnter={e => handleTextChange(e.target.value)}
            onChange={e => handleTextChange(e.target.value)}
            value={queryInfo.text}
            allowClear
          />
        </ItemCol>
        <ItemCol title="Status">
          <Select
            mode="multiple"
            allowClear={false}
            style={{ width: '100%' }}
            placeholder="Status filter"
            value={queryInfo.status || []}
            onChange={handleStatusFilter}
          >
            {StatusSelectOptions.map((x, i) => <Select.Option key={i} value={x.value}>
              {x.label}
            </Select.Option>)}
          </Select>
        </ItemCol>
        <ItemCol title="Tags">
          <TagSelect
            style={{ width: '100%' }}
            allowCreate={false}
            value={queryInfo.tags}
            onChange={handleTagsChange}
          />
        </ItemCol>
        <ItemCol title="Task template">
          <TaskTemplateSelect
            style={{ width: '100%' }}
            value={queryInfo.taskTemplateId} onChange={handleTaskTemplateIdChange} />
        </ItemCol>
        <ItemCol title="Assignee">
          <MemberSelect
            placeholder="Filter assignee"
            onChange={handleAssigneeChange}
            value={queryInfo.agentId}
          />
        </ItemCol>
        <ItemCol title="Client">
          <ClientSelect
            valueProp="id"
            style={{ width: '100%' }}
            value={queryInfo.clientId}
            onChange={handleClientIdChange}
            allowInput={false}
            bordered={true}
          />
        </ItemCol>
      </Row>
    </>
  );
};

TaskSearchPanel.propTypes = {
  queryInfo: PropTypes.shape({
    text: PropTypes.string,
    status: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    taskTemplateId: PropTypes.string,
    clientId: PropTypes.string,
    agentId: PropTypes.string,
  }),
  onChange: PropTypes.func,
};

TaskSearchPanel.defaultProps = {
};

