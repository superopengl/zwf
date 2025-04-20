import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Input, Form, Switch, Select, Space, Row, Col, Drawer, Typography } from 'antd';

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { TagSelect } from 'components/TagSelect';
import { MemberSelect } from 'components/MemberSelect';
import { OrgClientSelect } from 'components/OrgClientSelect';


export const TaskSearchPanel = props => {
  const { queryInfo, onChange, showStatusFilter } = props;

  const handleValuesChange = (changed, allValues) => {
    // console.log(changed, allValues);
    onChange({...queryInfo, ...allValues});
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
      <Form
        requiredMark={false}
        layout="vertical"
        onValuesChange={handleValuesChange}
        value={queryInfo}
        preserve={true}
      >
        <Form.Item label="Search text" name="text">
          <Input
            style={{ width: '100%' }}
            placeholder="Search task"
            allowClear
          />
        </Form.Item>
        {showStatusFilter && <Form.Item label="Task status" name="status">
          <Select
            mode="multiple"
            allowClear={false}
            style={{ width: '100%' }}
            placeholder="Status filter"
          >
            {StatusSelectOptions.map((x, i) => <Select.Option key={i} value={x.value}>
              {x.label}
            </Select.Option>)}
          </Select>
        </Form.Item>}
        <Form.Item label="Tags" name="tags">
          <TagSelect
            style={{ width: '100%' }}
            allowCreate={false}
            placeholder="Select tags"
          />
        </Form.Item>
        <Form.Item label="Assignee" name="assigneeId">
          <MemberSelect
            placeholder="Filter assignee"
          />
        </Form.Item>
        <Form.Item label="Client" name="clientId">
          <OrgClientSelect
            style={{ width: '100%' }}
            placeholder="Search a client"
            bordered={true}
          />
        </Form.Item>
        <Form.Item label="My watched tasks only" name="watchedOnly" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </>
  );
};

TaskSearchPanel.propTypes = {
  queryInfo: PropTypes.shape({
    text: PropTypes.string,
    status: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    femplateId: PropTypes.string,
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

