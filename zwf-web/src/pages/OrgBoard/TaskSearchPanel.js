import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Input, Card, Select, Space, Row, Col, Drawer, Typography } from 'antd';

import React from 'react';
import styled from 'styled-components';
import { ClientSelect } from 'components/ClientSelect';
import PropTypes from 'prop-types';
import { TagSelect } from 'components/TagSelect';
import { MemberSelect } from 'components/MemberSelect';
import { OrgClientSelect } from 'components/OrgClientSelect';

const { Paragraph } = Typography;


const ItemCol = props => {
  return <Col span={props.span || 24}>
    <Paragraph strong>{props.title}</Paragraph>
    {props.children}
  </Col>
}

export const TaskSearchPanel = props => {
  const { queryInfo, onChange,showStatusFilter, span } = props;

  const handleTextChange = (value) => {
    const text = value?.trim();
    onChange({ ...queryInfo, text });
  }

  const handleStatusFilter = (status) => {
    onChange({ ...queryInfo, status });
  }

  const handleAssigneeChange = (assigneeId) => {
    onChange({ ...queryInfo, assigneeId });
  }


  const handleClientIdChange = (client) => {
    onChange({ ...queryInfo, clientId: client?.id });
  }

  const handleTagsChange = tags => {
    onChange({ ...queryInfo, tags: tags ?? [], });
  }


  const StatusSelectOptions = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Action Required', value: 'action_required' },
    { label: 'Completed', value: 'done' },
    { label: 'Archived', value: 'archived' },
  ]

  return (
    <>
      <Row gutter={[20, 10]}>
        <ItemCol title="Search text" span={span}>
          <Input
            style={{ width: '100%' }}
            placeholder="Task name, client name, or client email"
            onPressEnter={e => handleTextChange(e.target.value)}
            onChange={e => handleTextChange(e.target.value)}
            value={queryInfo.text}
            allowClear
          />
        </ItemCol>
        {showStatusFilter && <ItemCol title="Status" span={span}>
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
        </ItemCol>}
        <ItemCol title="Tags" span={span}>
          <TagSelect
            style={{ width: '100%' }}
            allowCreate={false}
            value={queryInfo.tags}
            onChange={handleTagsChange}
          />
        </ItemCol>
        {/* <ItemCol title="Task template">
          <TaskTemplateSelect
            style={{ width: '100%' }}
            value={queryInfo.taskTemplateId} onChange={handleTaskTemplateIdChange} />
        </ItemCol> */}
        <ItemCol title="Assignee" span={span}>
          <MemberSelect
            placeholder="Filter assignee"
            onChange={handleAssigneeChange}
            value={queryInfo.assigneeId}
          />
        </ItemCol>
        <ItemCol title="Client" span={span}>
          <OrgClientSelect
            style={{ width: '100%' }}
            placeholder="Search a client"
            value={queryInfo.clientId}
            onChange={handleClientIdChange}
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
    assigneeId: PropTypes.string,
  }),
  onChange: PropTypes.func,
  showStatusFilter: PropTypes.bool,
  span: PropTypes.number,
};

TaskSearchPanel.defaultProps = {
  showStatusFilter: true,
  span: 24,
};

