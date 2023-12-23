import React from 'react';
import { AutoComplete, Select } from 'antd';
import PropTypes from 'prop-types';
import { listTaskTemplate } from 'services/taskTemplateService';
import ReactDOM from 'react-dom';
import { TaskTemplateIcon } from './entityIcon';
import { Layout, Modal, Row, Col, Skeleton, Typography } from 'antd';
import { Resizable } from "re-resizable";
import { TaskChatPanel } from 'components/TaskChatPanel';
import { TaskFormPanel } from 'components/TaskFormPanel';


export const TaskWorkPanel = React.forwardRef((props, ref) => {
  const { task, type, currentUserId } = props;

  const [chatPanelWidth, setChatPanelWidth] = React.useState(300);

  React.useEffect(() => {
  }, []);

  if (!task) {
    return null;
  }

  return <Row gutter={[20, 20]}>
    <Col style={{ overflowY: 'auto', flexGrow: 1 }}>
      <TaskFormPanel ref={ref} value={task} type={type} />
    </Col>
    <Resizable
      style={{ marginLeft: 16, paddingLeft: 16 }}
      size={{ width: chatPanelWidth, height: '100%' }}
      minWidth={300}
      maxWidth={600}
      enable={{ top: false, right: false, bottom: false, left: true }}
      handleClasses={{ left: 'resize-handler' }}
      onResizeStop={(e, direction, ref, d) => {
        setChatPanelWidth(w => Math.max(w + d.width, 300));
      }}
    >
      <Col style={{ overflowY: 'auto', height: '100%' }}>
        <TaskChatPanel taskId={task.id} currentUserId={currentUserId} />
      </Col>
    </Resizable>
  </Row>
});

TaskWorkPanel.propTypes = {
  task: PropTypes.object,
  type: PropTypes.string,
  currentUserId: PropTypes.string,
  ref: PropTypes.ref,
};

TaskWorkPanel.defaultProps = {
  type: 'client'
};

