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
import styled from 'styled-components';

const { Text, Paragraph, Link: TextLink } = Typography;

const StyledTable = styled(Table)`

.ant-table-cell, .ant-table-cell:hover {
  &:has(.task-status-action_required) {
    background-color: #F53F3F22 !important;
  }
  &:has(.task-status-todo) {
    background-color: #FAFAFA !important;
  }
  &:has(.task-status-in_progress) {
    background-color: #0FBFC444 !important;
  }
  &:has(.task-status-done) {
    background-color: #00B42A22 !important;
  }
  &:has(.task-status-archived) {
    background-color: #1C222B66 !important;

    .ant-badge-status-text {
      // color: #CCCCCC !important;
    }
  }
}
`;

export const TaskListPanel = (props) => {
  const { tasks, onChange, searchText, onChangeFitler, archivedMode } = props;

  const navigate = useNavigate();
  const postArchieveMessage = () => {
    notify.info('Task was archived', <>You can find all the archived tasks by fitler status <Tag>Archived</Tag></>)
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
        const { id, name, lastUnreadMessageAt } = record;
        return <div style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>
          <Link to={`/task/${id}?${lastUnreadMessageAt ? 'chat=1' : ''}`}>
            <TaskIcon />
            <Highlighter highlightClassName="search-highlighting" searchWords={[searchText]} autoEscape={true} textToHighlight={name || ''} />
            {lastUnreadMessageAt && <UnreadMessageIcon style={{ marginLeft: 4 }} />}
          </Link>

          {/* <small>
            <Text type="secondary">
                <FemplateIcon size={9} style={{marginRight: 4}}/>
                <Highlighter highlightClassName="search-highlighting" searchWords={[searchText]} autoEscape={true} textToHighlight={femplateName || ''} />
            </Text>
          </small> */}
        </div>
      },
      ellipsis: false,
    },
    {
      title: 'Client',
      dataIndex: 'orgClientId',
      render: (value) => <ClientNameCard id={value} />
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      width: 110,
      sorter: () => 0,
      render: (text) => <TimeAgo value={text} accurate={false} />
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      width: 130,
      sorter: () => 0, // Server end sorting. moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (text) => {
        return <TimeAgo value={text} accurate={false} />;
      }
    },
    // {
    //   title: 'Last Comment',
    //   dataIndex: 'lastUnreadMessageAt',
    //   width: 100,
    //   sorter: () => 0, // Server end sorting. moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
    //   render: (text) => {
    //     return <TimeAgo value={text} accurate={false} />;
    //   }
    // },
    archivedMode ? null : {
      title: 'Status',
      dataIndex: 'status',
      width: 160,
      sorter: () => 0,
      render: (value, record) => <TaskStatusButton
        className={`task-status-${value}`}
        size="small"
        value={value}
        bordered={false}
        style={{ width: '100%' }}
        onChange={(newStatus) => handleTaskStatusChange(record.id, newStatus)} />,
      ellipsis: false,
    },
    {
      title: 'Assignee',
      dataIndex: 'assigneeId',
      // filteredValue: filteredInfo.assigneeId || null,
      // filters: agentList.map(a => ({ text: `${a.givenName} ${a.surname}`, value: a.id })),
      // onFilter: (value, record) => record.assigneeId === value,
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
      render: (value, record) => archivedMode ? <UserNameCard userId={value} /> : <MemberSelect
        onChange={assigneeId => assignTaskToAgent(record, assigneeId)}
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
        placeholder="Select tags"
        bordered={false}
        readonly={archivedMode}
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

  ].filter(x => !!x);

  const assignTaskToAgent = (task, assigneeId) => {
    assignTask$(task.id, assigneeId).subscribe(() => {
      onChange();
    });
  }


  return (
    <StyledTable columns={columnDef}
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
            No tasks {onChangeFitler && <TextLink underline={true} onClick={onChangeFitler}>Change filter condition</TextLink>}
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
  onChangeFitler: PropTypes.func,
  archivedMode: PropTypes.bool,
};

TaskListPanel.defaultProps = {
  archivedMode: false,
};

