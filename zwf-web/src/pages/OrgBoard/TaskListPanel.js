import { Modal, Table, Tag, Typography } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import Highlighter from "react-highlight-words";
import { Link, useNavigate } from 'react-router-dom';
import { assignTask$, changeTaskStatus$, updateTaskTags$, } from '../../services/taskService';
import { UnreadMessageIcon } from 'components/UnreadMessageIcon';
import { TaskStatusButton } from 'components/TaskStatusButton';
import { notify } from 'util/notify';
import { TagSelect } from 'components/TagSelect';
import PropTypes from 'prop-types';
import { MemberSelect } from 'components/MemberSelect';
import { UserNameCard } from 'components/UserNameCard';
import { TaskIcon } from 'components/entityIcon';
import { ClientNameCard } from 'components/ClientNameCard';

const { Text, Paragraph, Link: TextLink } = Typography;
export const TaskListPanel = (props) => {
  const { tasks, onChange, searchText } = props;

  const navigate = useNavigate();
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

  const handleTagChange = (item, tags) => {
    // $(user.id, tags).subscribe()
    updateTaskTags$(item.id, tags).subscribe();
  }

  const columnDef = [
    {
      title: 'Task Name',
      dataIndex: 'name',
      fixed: 'left',
      // filteredValue: filteredInfo.name || null,
      sorter: () => 0,
      // onFilter: (value, record) => record.name.includes(value),
      render: (text, record) => {
        const { id, name, taskTemplateName, lastUnreadMessageAt } = record;
        return <div style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>
          <Link to={`/task/${id}?${lastUnreadMessageAt ? 'chat=1' : ''}`}>
            <TaskIcon />
            <Highlighter highlightClassName="search-highlighting" searchWords={[searchText]} autoEscape={true} textToHighlight={name || ''} />
            {lastUnreadMessageAt && <UnreadMessageIcon style={{ marginLeft: 4 }} />}
          </Link>

          {/* <small>
            <Text type="secondary">
                <TaskTemplateIcon size={9} style={{marginRight: 4}}/>
                <Highlighter highlightClassName="search-highlighting" searchWords={[searchText]} autoEscape={true} textToHighlight={taskTemplateName || ''} />
            </Text>
          </small> */}
        </div>
      },
      ellipsis: false,
    },
    {
      title: 'Client',
      dataIndex: 'orgClientId',
      render: (value, item) => <ClientNameCard id={value} />
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      width: 100,
      sorter: () => 0,
      render: (text) => <TimeAgo value={text} accurate={false} />
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      width: 100,
      sorter: () => 0, // Server end sorting. moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (text) => {
        return <TimeAgo value={text} accurate={false} />;
      }
    },
    {
      title: 'Last Comment',
      dataIndex: 'lastUnreadMessageAt',
      width: 100,
      sorter: () => 0, // Server end sorting. moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (text) => {
        return <TimeAgo value={text} accurate={false} />;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 160,
      sorter: () => 0,
      render: (value, record) => <small>
        <TaskStatusButton size="small" value={value} bordered={false} onChange={(newStatus) => handleTaskStatusChange(record.id, newStatus)} />
      </small>,
      ellipsis: false
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
        onChange={agentId => assignTaskToAgent(record, agentId)}
        value={value}
        bordered={false}
      />
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
      render: (tags, item) => <TagSelect
        value={tags.map(t => t.id)}
        onChange={tags => handleTagChange(item, tags)}
        inPlaceEdit={true}
        placeholder="Click to select tags"
      />

    },
    // {
    //   fixed: 'right',
    //   align: 'center',
    //   width: 70,
    //   render: (text, record) => (
    //     <DropdownMenu
    //       config={[
    //         {
    //           icon: <EditOutlined />,
    //           menu: 'Edit',
    //           onClick: () => navigate(`/task/${record.id}`)
    //         },
    //         {
    //           icon: <Text type="danger"><CloseOutlined /></Text>,
    //           menu: <Text type="danger">Archive</Text>,
    //           onClick: () => handleDelete(record)
    //         }
    //       ]}
    //     />
    //   ),
    // },

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
        changeTaskStatus$(id, 'archived').subscribe(() => onChange());
      },
      maskClosable: true,
      closable: true,
      autoFocusButton: 'cancel',
      okButtonProps: {
        danger: true
      },
      cancelButtonProps: {
        type: 'text',
      }
    });
  }

  return (
    <Table columns={columnDef}
      dataSource={tasks}
      // style={{marginTop: 30}}
      // bordered
      rowKey="id"
      size="small"
      pagination={false}
      scroll={{
        x: 'max-content'
      }}
      // onChange={handleTableChange}
      rowClassName={(record) => record.lastUnreadMessageAt ? 'unread' : ''}
      onRow={(record) => ({
        onDoubleClick: () => {
          navigate(`/task/${record.id}?${record.lastUnreadMessageAt ? 'chat=1' : ''}`);
        }
      })}
      locale={{
        emptyText: <div style={{ margin: '30px auto' }}>
          <Paragraph type="secondary">
            There is no task. <br />Try to modify the filter condition or clear filter.
          </Paragraph>
        </div>
      }}
    />
  );
};

TaskListPanel.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  searchText: PropTypes.string,
};

TaskListPanel.defaultProps = {};

