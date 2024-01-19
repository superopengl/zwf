import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Input, Card, Select, Space, Row, Drawer, Descriptions } from 'antd';

import React from 'react';
import styled from 'styled-components';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import ClientSelect from 'components/ClientSelect';
import { AssigneeSelect } from 'components/AssigneeSelect';
import PropTypes from 'prop-types';
import { TaskTagSelect } from 'components/TaskTagSelect';

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
`;

const Label = styled.div`
  // width: 100px;
`;

export const TaskSearchDrawer = props => {
  const { queryInfo: propQueryInfo, onChange, visible, onClose } = props;

  const [queryInfo, setQueryInfo] = React.useState(propQueryInfo);

  const handleSearch = (value) => {
    const text = value?.trim();
    setQueryInfo({ ...queryInfo, text });
  }

  const handleStatusFilter = (status) => {
    setQueryInfo({ ...queryInfo, status });
  }

  const handleAssigneeChange = (agentId) => {
    setQueryInfo({ ...queryInfo, agentId });
  }

  const handleTaskTemplateIdChange = (taskTemplateId) => {
    setQueryInfo({ ...queryInfo, taskTemplateId, });
  }

  const handleClientIdChange = (client) => {
    setQueryInfo({ ...queryInfo, clientId: client?.id, });
  }

  const handleTagsChange = tags => {
    setQueryInfo({ ...queryInfo, tags: tags ?? [], });
  }

  const handleExecuteSearch = () => {
    onChange(queryInfo);
    onClose();
  }

  const StatusSelectOptions = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Pending Fix', value: 'pending_fix' },
    { label: 'Pending Sign', value: 'pending_sign' },
    { label: 'Signed', value: 'signed' },
    { label: 'Done', value: 'done' },
    { label: 'Archived', value: 'archived' },
  ]

  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      title="Task Filter"
      placement="left"
      maskClosable
      destroyOnClose={true}
      closable={false}
      contentWrapperStyle={{ width: "80vw", maxWidth: 600 }}
      extra={
        <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
      }
    >
      <Descriptions layout="vertical" column={1}>
        <Descriptions.Item label="Search text">
          <Input
            style={{ width: '100%' }}
            placeholder="Task name, client name, or client email"
            enterButton={<><SearchOutlined /> Search</>}
            onPressEnter={e => handleSearch(e.target.value)}
            onChange={e => handleSearch(e.target.value)}
            value={queryInfo.text}
            allowClear
          />
        </Descriptions.Item>
        <Descriptions.Item label="Status">
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
        </Descriptions.Item>
        <Descriptions.Item label="Tags">
          <TaskTagSelect
            style={{ width: '100%' }}
            allowCreate={false}
            value={queryInfo.tags}
            onChange={handleTagsChange}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Task template">
          <TaskTemplateSelect
            style={{ width: '100%' }}
            value={queryInfo.taskTemplateId} onChange={handleTaskTemplateIdChange} />
        </Descriptions.Item>
        <Descriptions.Item label="Assignee">
          <AssigneeSelect
            placeholder="Filter assignee"
            onChange={handleAssigneeChange}
            value={queryInfo.agentId}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Client">
          <ClientSelect
            valueProp="id"
            style={{ width: '100%' }}
            value={queryInfo.clientId}
            onChange={handleClientIdChange}
            allowInput={false}
          />
        </Descriptions.Item>
        <Descriptions.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={handleExecuteSearch} icon={<SearchOutlined />}>Search</Button>
          </Space>
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

TaskSearchDrawer.propTypes = {
  queryInfo: PropTypes.shape({
    text: PropTypes.string,
    status: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    taskTemplateId: PropTypes.string,
    clientId: PropTypes.string,
    agentId: PropTypes.string,
  }),
  onChange: PropTypes.func,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

TaskSearchDrawer.defaultProps = {
  visible: false,
};

