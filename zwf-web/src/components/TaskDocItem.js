import React from 'react';
import styled from 'styled-components';

import PropTypes from 'prop-types';
import { Typography, Space, List, Tooltip, Tag, Avatar, Button, Checkbox, Row, Col } from 'antd';
import { FileIcon } from './FileIcon';
import { TimeAgo } from './TimeAgo';
import { GlobalContext } from 'contexts/GlobalContext';
import { CheckOutlined, CheckSquareOutlined, BorderOutlined } from '@ant-design/icons'
import _ from 'lodash';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { BsPatchCheck } from 'react-icons/bs';
import { showSignTaskDocModal } from './showSignTaskDocModal';
import { FaFileSignature } from 'react-icons/fa';
import { genDoc$, getTaskDocDownloadUrl, toggleTaskDocsRequiresSign$ } from "services/taskDocService";
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { finalize } from 'rxjs/operators';
import DropdownMenu from './DropdownMenu';
import { MdBrightnessAuto } from 'react-icons/md';
import { Modal } from 'antd';
import { FaSignature } from 'react-icons/fa';

const { Link, Text } = Typography;

const StyledListItem = styled(Row)`
// margin-top: 4px;
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

const getAutoDocTag = (taskFile, role) => {
  if (role === 'client' || taskFile.type !== 'auto') {
    return null;
  }

  let label = 'pending';
  let color = '#cf222e';
  let tooltipMessage = 'The file is not generated yet. Fill in fields first.';
  if (taskFile.fileId) {
    label = 'generated';
    color = '#2da44e';
    tooltipMessage = 'The file has been generated.';
  }

  return <Tooltip title={tooltipMessage}>
    <Icon component={MdBrightnessAuto} style={{ color, fontSize: 20 }} />
  </Tooltip>
}

const getMissingVarWarningMessage = (taskFile, varBag) => {
  const { refFields, fileId } = taskFile;
  const missingVars = [];
  if (!fileId && refFields) {
    for (const varName of refFields) {
      const def = varBag[varName];
      if (!def) {
        // Not found in varBag
        missingVars.push(<>Variable '<strong>{varName}</strong>' is not defined in task</>)
      } else if (def.value === undefined || (_.isString(def.value) && def.value === '')) {
        missingVars.push(<>Field '<strong>{def.fieldName}</strong>' has no value</>)
      }
    }
  }

  return missingVars;
}

export const TaskDocItem = React.memo(props => {
  const { value: taskFile, showIcon, style, showCreatedAt, strong, onChange, onDelete, varBag } = props;
  const context = React.useContext(GlobalContext);
  const { user, role } = context;

  const isClient = role === 'client';
  const isOrg = role === 'agent' || role === 'admin';

  const canClientSign = isClient && taskFile.requiresSign && !taskFile.signedAt

  const canDelete = isOrg && !taskFile.signedAt;

  const handleToggleRequireSign = () => {
    taskFile.requiresSign = !taskFile.requiresSign;
    onChange(taskFile);
  }

  const handleSignTaskDoc = () => {
    showSignTaskDocModal(taskFile, {
      onOk: () => {
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

  const iconOverlay = getAutoDocTag(taskFile, context.role);

  return <StyledListItem
    onClick={e => e.stopPropagation()}
  // className={missingVars.length > 0 ? 'error-doc' : !taskFile.fileId ? 'not-generated' : null}
  >
    <Col flex={1}>
      <Space>
        <div style={{ position: 'relative' }}>
          <FileIcon name={taskFile.name} />
          {iconOverlay && <div
            style={{ position: 'absolute', right: -6, top: -6 }}
          >{iconOverlay}</div>}
        </div>
        <Link href={getTaskDocDownloadUrl(taskFile.fileId)} target="_blank">{taskFile.name}</Link>
      </Space>
    </Col>
    <Col style={{ paddingTop: 6 }}>
      {canClientSign && <Tooltip title="Sign this document">
        <Button
          type="primary"
          danger
          icon={<Icon component={FaSignature} />}
          onClick={handleSignTaskDoc}
        >Sign</Button>
      </Tooltip>}
      {isOrg && <Tooltip title={taskFile.requiresSign ? 'Click to cancel the signature request' : 'Ask client to sign this doc'}>
        <Button shape="circle"
          type={taskFile.requiresSign ? 'primary' : 'default'}
          icon={<Icon component={FaSignature} />}
          onClick={handleToggleRequireSign}
        />
      </Tooltip>}
      {isOrg && <Tooltip title="Delete file">
        <Button key="delete" danger icon={<DeleteOutlined />} type="link" onClick={handleDelete} disabled={!canDelete} />
      </Tooltip>}
    </Col>
  </StyledListItem>

  // return <StyledListItem onClick={e => e.stopPropagation()}
  //   className={missingVars.length > 0 ? 'error-doc' : !taskFile.fileId ? 'not-generated' : null}
  //   actions={isClient ? null : [
  //     // <Button key="auto" icon={<Icon component={BsPatchCheck } />} type="link">Generate</Button>,
  //     taskFile.signedAt ? null : <Checkbox key="require-sign" checked={taskFile.requiresSign} onClick={e => handleToggleRequireSign(taskFile, e.target.checked)}><Link>Require sign</Link></Checkbox>,
  //     <Button key="delete" danger icon={<DeleteOutlined />} type="link" onClick={() => handleDelete(taskFile)}></Button>,
  //   ].filter(x => x)}
  //   extra={<>
  //     {canClientSign(taskFile) && <Button type="link" icon={<Icon component={FaFileSignature} />} onClick={(e) => handleSignTaskDoc(taskFile, e)}>Sign</Button>}
  //     {!isClient && menuConfig.length > 0 && <DropdownMenu config={menuConfig} />}
  //     {taskFile.signedAt && <Tooltip title={<TimeAgo value={taskFile.signedAt} />}><Tag>Signed</Tag></Tooltip>}
  //   </>}
  // >
  //   <List.Item.Meta
  //     avatar={<div style={{ position: 'relative' }}>
  //       <FileIcon name={taskFile.name} />
  //       {iconOverlay && <div
  //         style={{ position: 'absolute', right: -6, top: -6 }}
  //       >{iconOverlay}</div>}
  //     </div>}
  //     title={<Link href={getTaskDocDownloadUrl(taskFile.fileId)} target="_blank">{taskFile.name}</Link>}
  //     description={<>
  //       {showCreatedAt && taskFile.createdAt && <div><TimeAgo value={taskFile.createdAt} prefix="Created:" direction="horizontal" accurate={false} showTime={false} /></div>}
  //       {missingVars.length > 0 && <div style={{ marginTop: 4 }}>{missingVars.map(x => <div><Text type="danger">{x}</Text></div>)}</div>}
  //     </>}
  //   />
  // </StyledListItem>
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
  varBag: PropTypes.object,
};

TaskDocItem.defaultProps = {
  showIcon: true,
  showCreatedAt: false,
  varBag: {},
  onChange: () => { },
  onDelete: () => { },
}

