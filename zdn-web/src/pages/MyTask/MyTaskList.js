import { Button, List, Space } from 'antd';
import Text from 'antd/lib/typography/Text';
import { TaskStatus } from 'components/TaskStatus';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { EditOutlined, ZoomInOutlined, HighlightOutlined } from '@ant-design/icons';
import { Badge } from 'antd';
import PropTypes from 'prop-types';


const MyTaskList = (props) => {

  const { data, loading, onItemClick, avatar } = props;

  // const goToEditTask = (id) => {
  //   props.history.push(`/tasks/${id || 'new'}`);
  // }

  // const goToViewTask = (id) => {
  //   props.history.push(`/tasks/${id}/view`);
  // }

  const actionOnTask = task => {
    onItemClick(task);
    // if (['to_sign', 'signed', 'complete'].includes(task.status)) {
    //   goToViewTask(task.id);
    // } else {
    //   goToEditTask(task.id);
    // }
  }

  const getActionIcon = status => {
    switch (status) {
      case 'todo':
        return <EditOutlined />
      case 'to_sign':
        return <HighlightOutlined />
      case 'signed':
      case 'complete':
      case 'archive':
      default:
        return <ZoomInOutlined />
    }
  }

  const getDotComponent = (item) => {
    const color = item.status === 'to_sign' ? 'red' : item.lastUnreadMessageAt ? 'blue' : null;
    if (!color) return null;
    return <Badge color={color} style={{ position: 'absolute', top: -5, left: 0 }} />
  }

  return <List
    itemLayout="horizontal"
    dataSource={data}
    size="large"
    loading={loading}
    renderItem={item => (
      <List.Item
        style={{ paddingLeft: 0, paddingRight: 0 }}
        key={item.id}
        onClick={() => actionOnTask(item)}
      >
        <List.Item.Meta
          avatar={<div style={{ position: 'relative' }}>
            {getDotComponent(item)}
            <TaskStatus key="1" status={item.status} width={60} name={item.forWhom} portfolioId={item.portfolioId} style={{ marginTop: 6 }} avatar={avatar} />
          </div>}

          title={<Text style={{ fontSize: '1rem' }}>{item.name}</Text>}
          description={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <TimeAgo value={item.lastUpdatedAt} prefix="Last Updated" accurate={true} />
            <Space>
              <Button type="link" key="action" type="link" onClick={() => actionOnTask(item)} icon={getActionIcon(item.status)}></Button>
              {/* {item.status === 'draft' && <>
                  <Button key="delete" type="link" danger disabled={loading} onClick={e => handleDelete(e, item)} icon={<DeleteOutlined />}></Button>
                </>} */}
            </Space>
          </Space>
          }
        />
      </List.Item>
    )}
  />
};

MyTaskList.propTypes = {
  avatar: PropTypes.bool
};

MyTaskList.defaultProps = {
  avatar: true
};

export default withRouter(MyTaskList);
