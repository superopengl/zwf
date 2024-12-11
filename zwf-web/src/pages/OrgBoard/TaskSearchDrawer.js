import { CloseOutlined } from '@ant-design/icons';
import { Button, Drawer } from 'antd';

import React from 'react';
import PropTypes from 'prop-types';
import { TaskSearchPanel } from './TaskSearchPanel';


export const TaskSearchDrawer = props => {
  const { queryInfo: propQueryInfo, onChange, visible, onClose } = props;

  const [queryInfo, setQueryInfo] = React.useState(propQueryInfo);


  const handleChange = (queryInfo) => {
    onChange(queryInfo);
    setQueryInfo(queryInfo);
    onClose();
  }

  return (
    <Drawer
    open={visible}
      onClose={onClose}
      title="Task Filter"
      placement="right"
      maskClosable={true}
      destroyOnClose={true}
      closable={false}
      contentWrapperStyle={{ width: "80vw", maxWidth: 600 }}
      extra={
        <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
      }
    >
      <TaskSearchPanel queryInfo={queryInfo} onChange={handleChange} />
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

