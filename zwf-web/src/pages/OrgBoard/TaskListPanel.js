import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Modal, Space, Table, Tag } from 'antd';
import Text from 'antd/lib/typography/Text';

import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import Highlighter from "react-highlight-words";
import { Link } from 'react-router-dom';
import { assignTask$, changeTaskStatus$, deleteTask$ } from '../../services/taskService';
import { UnreadMessageIcon } from 'components/UnreadMessageIcon';
import { TaskStatusButton } from 'components/TaskStatusButton';
import DropdownMenu from 'components/DropdownMenu';
import { UserDisplayName } from 'components/UserDisplayName';
import { UserAvatar } from 'components/UserAvatar';
import { notify } from 'util/notify';
import { TagSelect } from 'components/TagSelect';
import PropTypes from 'prop-types';
import { MemberSelect } from 'components/MemberSelect';


export const TaskListPanel = (props) => {
  const { tasks, onChange, searchText } = props;

  const postArchieveMessage = () => {
    notify.info('Task was archieved', <>You can find all the archived tasks by fitler status <Tag>Archived</Tag></>)
  }

  const handleTaskStatusChange = (taskId, newStatus) => {
    changeTaskStatus$(taskId, newStatus)
      .subscribe(() => {
        onChange();
        if (newStatus === 'archived') {
          postArchieveMessage();
        }
      })
  }
  const columnDef = [
    {
      title: 'Task Name',
      dataIndex: 'name',
      // filteredValue: filteredInfo.name || null,
      sorter: () => 0,
      // onFilter: (value, record) => record.name.includes(value),
      render: (text, record) => {
        const { id, name, forWhom, lastUnreadMessageAt } = record;
        return <div>
          <Link to={`/task/${id}?${lastUnreadMessageAt ? 'chat=1' : ''}`}>
            <Highlighter highlightClassName="search-highlighting" searchWords={[searchText]} autoEscape={true} textToHighlight={name || ''} />
            {lastUnreadMessageAt && <UnreadMessageIcon style={{ marginLeft: 4 }} />}
          </Link>
          <Space size="small" style={{ alignItems: 'center', width: '100%' }}>
            <Highlighter highlightClassName="search-highlighting" searchWords={[searchText]} autoEscape={true} textToHighlight={forWhom || ''} />
          </Space>
        </div>
      },
      ellipsis: false,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: () => 0,
      render: (value, record) => <small>
        <TaskStatusButton size="small" value={value} onChange={(newStatus) => handleTaskStatusChange(record.id, newStatus)} />
      </small>,
      ellipsis: false
    },
    {
      title: 'Task Template',
      dataIndex: 'taskTemplateName',
      sorter: () => 0,
      render: (text) => <Highlighter highlightClassName="search-highlighting" searchWords={[searchText]} autoEscape={true} textToHighlight={text || ''} />,
      ellipsis: false
    },
    {
      title: 'User',
      dataIndex: 'email',
      sorter: () => 0,
      render: (text, item) => <Space direction='horizontal'>
        <UserAvatar value={item.avatarId} color={item.avatarColorHex} size={32} />
        <UserDisplayName
          email={item.email}
          surname={item.surname}
          givenName={item.givenName}
          searchText={searchText}
        />
      </Space>
    },
    {
      title: 'Assignee',
      dataIndex: 'assigneeId',
      // filteredValue: filteredInfo.agentId || null,
      // filters: agentList.map(a => ({ text: `${a.givenName} ${a.surname}`, value: a.id })),
      // onFilter: (value, record) => record.agentId === value,
      sorter: () => 0,
      // render: (text, record) => <Select
      //   size="small"
      //   placeholder="Select an agent"
      //   style={{ width: 130 }}
      //   onChange={value => assignTaskToAgent(record, value)}
      //   value={text}
      // >
      //   <Select.Option key={-1} value={null}>{' '}</Select.Option>
      //   {agentList.map((a, i) => <Select.Option key={i} value={a.id}>{myUserId === a.id ? 'Me' : `${a.givenName || 'Unset'} ${a.surname || 'Unset'}`}</Select.Option>)}
      // </Select>,
      render: (value, record) => <MemberSelect
        onChange={agent => assignTaskToAgent(record, agent.id)}
        value={value}
        bordered={false}
      />
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      sorter: () => 0,
      render: (text) => <TimeAgo value={text} accurate={false} showTime={false} />
    },
    {
      title: 'Last Update At',
      dataIndex: 'lastUpdatedAt',
      sorter: () => 0, // Server end sorting. moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (text) => {
        return <TimeAgo value={text} accurate={false} showTime={false}/>;
      }
    },
    {
      title: 'Last Unread Message',
      dataIndex: 'lastUnreadMessageAt',
      sorter: () => 0, // Server end sorting. moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (text) => {
        return <TimeAgo value={text} accurate={false} showTime={false}/>;
      }
    },
    // {
    //   title: 'Due Date',
    //   dataIndex: 'dueDate',
    //   sorter: () => 0, // Server end sorting. moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
    //   render: (value) => value && <TimeAgo value={value} />
    // },
    {
      title: 'Tags',
      dataIndex: 'tags',
      render: (tags) => <TagSelect readonly={true} value={tags.map(t => t.id)} />
    },
    {
      // title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, record) => (
        <DropdownMenu
          config={[
            {
              icon: <EditOutlined />,
              menu: 'Edit',
              onClick: () => props.history.push(`/tasks/${record.id}`)
            },
            {
              icon: <Text type="danger"><DeleteOutlined /></Text>,
              menu: <Text type="danger">Archive</Text>,
              onClick: () => handleDelete(record)
            }
          ]}
        />
      ),
    },
    
  ];

  const assignTaskToAgent = (task, agentId) => {
    assignTask$(task.id, agentId).subscribe(() => {
      onChange();
    });
  }

  const handleDelete = async (item) => {
    const { id, name } = item;
    Modal.confirm({
      title: <>Archive task <Text strong>{name}</Text>?</>,
      okText: 'Yes, Archive it',
      onOk: () => {
        postArchieveMessage();
        deleteTask$(id).subscribe(() => onChange());
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      }
    });
  }

  return (
    <Table columns={columnDef}
      dataSource={tasks}
      // scroll={{x: 1000}}
      // style={{marginTop: 30}}
      rowKey="id"
      size="small"
      pagination={false}
      // onChange={handleTableChange}
      rowClassName={(record) => record.lastUnreadMessageAt ? 'unread' : ''}
      onRow={(record) => ({
        onDoubleClick: () => {
          props.history.push(`/task/${record.id}?${record.lastUnreadMessageAt ? 'chat=1' : ''}`);
        }
      })}
    />
  );
};

TaskListPanel.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  searchText: PropTypes.string,
};

TaskListPanel.defaultProps = {};

