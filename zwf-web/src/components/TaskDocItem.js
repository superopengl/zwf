import React from 'react';
import styled from 'styled-components';

import PropTypes from 'prop-types';
import { Typography, Space, Tooltip, Avatar, Button, Row, Col } from 'antd';
import _ from 'lodash';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { showSignTaskFileModal } from './showSignTaskFileModal';
import { Modal } from 'antd';
import { FaSignature } from 'react-icons/fa';
import { TaskFileName } from './TaskFileName';
import { useRole } from 'hooks/useRole';

const { Link, Text } = Typography;

const StyledListItem = styled(Row)`
margin-top: 4px;
padding: 4px 0;

&.error-doc {
  background-color: #cf222e11;
}

&.not-generated {
  background-color: #ffc53d22;
}

.ant-list-item-action {
  margin-left: 46px;
}

.ant-list-item-action-split {
  display: none;
}
`;

export const TaskDocItem = React.memo(props => {
  const { value: taskFile, showIcon, style, showCreatedAt, strong, onChange, onDelete, disabled } = props;
  const role = useRole();

  const isClient = role === 'client';
  const isOrg = role === 'agent' || role === 'admin';

  const canClientSign = isClient && taskFile.requiresSign && !taskFile.signedAt
  const canRequestSign = isOrg && !taskFile.signedAt;

  const canDelete = isOrg && !taskFile.signedAt;

  const handleToggleRequireSign = () => {
    taskFile.requiresSign = !taskFile.requiresSign;
    onChange(taskFile);
  }

  const handleSignTaskDoc = () => {
    showSignTaskFileModal(taskFile, {
      onOk: () => {
        taskFile.signedAt = new Date();
        onChange(taskFile);
      },
    })
  }

  const handleDelete = () => {
    Modal.confirm({
      title: <Space>
        <Avatar icon={<DeleteOutlined />} style={{ backgroundColor: '#cf222e' }} />
        Delete file
      </Space>,
      content: <>Delete file <strong>{taskFile.name}</strong> from this task?</>,
      closable: true,
      maskClosable: true,
      icon: null,
      onOk: () => onDelete(taskFile),
      okText: 'Delete it',
      okButtonProps: {
        type: 'primary',
        ghost: true,
        danger: true,
      },
      cancelButtonProps: {
        type: 'text'
      },
      autoFocusButton: 'cancel',
      focusTriggerAfterClose: true,
    });
  }

  return <StyledListItem
    onClick={e => e.stopPropagation()}
  // className={missingVars.length > 0 ? 'error-doc' : !taskFile.fileId ? 'not-generated' : null}
  >
    <Col flex={1}>
      <TaskFileName taskFile={taskFile} />
    </Col>
    {!disabled && <Col style={{ paddingTop: 6 }}>
      <Space size="small">
        {canClientSign && <Tooltip title="Sign this document">
          <Button
            type="primary"
            danger
            icon={<Icon component={FaSignature} />}
            onClick={handleSignTaskDoc}
          >Sign</Button>
        </Tooltip>}
        {canRequestSign && <Tooltip title={taskFile.requiresSign ? 'Click to cancel the signature request' : 'Ask client to sign this doc'}>
          <Button shape="circle"
            type={taskFile.requiresSign ? 'primary' : 'default'}
            icon={<Icon component={FaSignature} />}
            onClick={handleToggleRequireSign}
          />
        </Tooltip>}
        {isOrg && <Tooltip title="Delete file">
          <Button key="delete" danger icon={<DeleteOutlined />} type="link" onClick={handleDelete} disabled={!canDelete} />
        </Tooltip>}
      </Space>
    </Col>}
  </StyledListItem>
});

TaskDocItem.propTypes = {
  value: PropTypes.shape({
    fileId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
  }).isRequired,
  showIcon: PropTypes.bool,
  showCreatedAt: PropTypes.bool,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  disabled: PropTypes.bool,
};

TaskDocItem.defaultProps = {
  showIcon: true,
  showCreatedAt: false,
  onChange: () => { },
  onDelete: () => { },
  disabled: false,
}

