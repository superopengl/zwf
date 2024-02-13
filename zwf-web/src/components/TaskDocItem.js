import React from 'react';
import styled from 'styled-components';

import PropTypes from 'prop-types';
import { Typography, Space, List, Tooltip, Tag, Checkbox, Button } from 'antd';
import { FileIcon } from './FileIcon';
import { TimeAgo } from './TimeAgo';
import { GlobalContext } from 'contexts/GlobalContext';
import { CheckOutlined } from '@ant-design/icons'
import _ from 'lodash';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { BsPatchCheck } from 'react-icons/bs';
import { showSignTaskDocModal } from './showSignTaskDocModal';
import { FaFileSignature } from 'react-icons/fa';
import { genDoc$, getTaskDocDownloadUrl, toggleTaskDocsOfficialOnly$, toggleTaskDocsRequiresSign$ } from "services/taskDocService";
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { finalize } from 'rxjs/operators';

const { Link, Text } = Typography;

const StyledActionButtons = styled(Space)`
gap: 0px !important;

.ant-checkbox-wrapper {
  margin: 5px 0;
}

button {
  text-align: left;
  padding-left: 0;
}
`;

const getAutoDocTag = (taskDoc, role) => {
  if (role === 'client' || taskDoc.type !== 'auto') {
    return null;
  }

  let label = 'pending';
  let color = '#fadb14';
  let tooltipMessage = 'The file is not generated yet. Fill in fields first.';
  if (taskDoc.fileId) {
    label = <CheckOutlined />;
    color = '#2da44e';
    tooltipMessage = 'The file has been generated.';
  }

  return <Tooltip title={tooltipMessage}>
    <Tag color={color} style={{ borderRadius: 999 }}>{label}</Tag>
  </Tooltip>
}

const getMissingVarWarningMessage = (variables, varBag) => {
  const missingVars = [];
  // debugger;
  for (const varName of (variables || [])) {
    const def = varBag[varName];
    if (!def) {
      // Not found in varBag
      missingVars.push(<>Variable '<strong>{varName}</strong>' is not defined in task</>)
    } else if (def.value === undefined || (_.isString(def.value) && def.value === '')) {
      missingVars.push(<>Field '<strong>{def.fieldName}</strong>' has no value</>)
    }
  }

  return missingVars.length ? missingVars : null;
}

export const TaskDocItem = React.memo(props => {
  const { taskDoc, showIcon, style, showCreatedAt, strong, onChange, onDelete, iconOverlay, varBag, onLoading } = props;
  const context = React.useContext(GlobalContext);
  const { user, role } = context;

  const isClient = role === 'client';
  const isAgent = role === 'agent' || role === 'admin';

  const missingVars = React.useMemo(() => {
    return getMissingVarWarningMessage(taskDoc.variables, varBag)
  }, [taskDoc, varBag]);

  const canDelete = (taskDoc) => {
    switch (taskDoc.type) {
      case 'client':
        return role === 'client' && user.id === taskDoc.createdBy && !taskDoc.signedAt
      case 'auto':
      case 'agent':
        return (role === 'admin' || role === 'agent') && !taskDoc.signedAt;
    }
    return false;
  }

  const canToggleOfficalOnly = (taskDoc) => {
    return isAgent && taskDoc.type !== 'client' && !taskDoc.signedAt
  }

  const canRequestClientSign = (taskDoc) => {
    return isAgent && taskDoc.type !== 'client' && taskDoc.fileId && !taskDoc.signedAt
  }

  const canClientSign = (taskDoc) => {
    return isClient && taskDoc.requiresSign && !taskDoc.signedAt
  }

  const canGenDoc = (taskDoc) => {
    return !isClient && taskDoc.docTemplateId && !taskDoc.fileId
  }

  const handleToggleOfficialOnly = (taskDoc, e) => {
    e.stopPropagation();
    const checked = e.target.checked;
    toggleTaskDocsOfficialOnly$(taskDoc.id, checked).subscribe(() => {
      taskDoc.officialOnly = checked;
      onChange()
    })
  }

  const handleToggleRequireSign = (taskDoc, e) => {
    e.stopPropagation();
    const checked = e.target.checked;
    onLoading(true)
    toggleTaskDocsRequiresSign$(taskDoc.id, checked).pipe(
      finalize(() => onLoading(false))
    ).subscribe(() => {
      onChange()
    })
  }

  const handleSignTaskDoc = (taskDoc, e) => {
    e.stopPropagation();
    onLoading(true)
    showSignTaskDocModal(taskDoc, {
      onOk: () => {
        onChange();
        onLoading(false)
      }
    })
  }

  const handleDeleteDoc = (item, e) => {
    e.stopPropagation();
    onDelete();
  }

  const handleGenDoc = (item, e) => {
    e.stopPropagation();
    const taskDocId = item.id;
    onLoading(true)
    genDoc$(taskDocId).pipe(
      finalize(() => onLoading(false))
    ).subscribe(() => {
      onChange();
    });
  }

  return <List.Item onClick={e => {
    e.stopPropagation();
  }}
    extra={<>
      {taskDoc.signedAt ? <TimeAgo value={taskDoc.signedAt} prefix="Signed:" accurate={false} showTime={false} /> : <StyledActionButtons direction="vertical">
        {canRequestClientSign(taskDoc) && <Checkbox key="official" checked={taskDoc.requiresSign} onClick={(e) => handleToggleRequireSign(taskDoc, e)} ><Link>Need client sign</Link></Checkbox>}
        <Checkbox key="official" checked={taskDoc.officialOnly} onClick={(e) => handleToggleOfficialOnly(taskDoc, e)} disabled={!canToggleOfficalOnly(taskDoc)} ><Link>Hide from client</Link></Checkbox>
        {canGenDoc(taskDoc) && <Button type="link" block icon={<Icon component={() => <BsPatchCheck />} />} onClick={(e) => handleGenDoc(taskDoc, e)} >Generate doc</Button>}
        {canDelete(taskDoc) && <ConfirmDeleteButton danger type="text" icon={<DeleteOutlined />} onOk={(e) => handleDeleteDoc(taskDoc, e)} >Delete</ConfirmDeleteButton>}
        {canClientSign(taskDoc) && <Button type="link" icon={<Icon component={() => <FaFileSignature />} />} onClick={(e) => handleSignTaskDoc(taskDoc, e)}>Sign</Button>}
      </StyledActionButtons>}
    </>}
  >
    <List.Item.Meta
      avatar={<div style={{ position: 'relative' }}>
        <FileIcon name={taskDoc.name} />
        {iconOverlay && <div
          style={{ position: 'absolute', right: -2, top: -2 }}
        >{iconOverlay}</div>}
      </div>}
      title={<Link href={getTaskDocDownloadUrl(taskDoc.id)} target="_blank">
        {taskDoc.name} {getAutoDocTag(taskDoc, context.role)}
      </Link>}
      description={<>
        {showCreatedAt && taskDoc.createdAt && <div><TimeAgo value={taskDoc.createdAt} prefix="Created:" direction="horizontal" /></div>}
        {missingVars && <div style={{ marginTop: 4 }}>{missingVars.map(x => <div><Text type="danger">{x}</Text></div>)}</div>}
      </>}
    />
  </List.Item>
});

TaskDocItem.propTypes = {
  taskDoc: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
  }).isRequired,
  showIcon: PropTypes.bool,
  showCreatedAt: PropTypes.bool,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  onLoading: PropTypes.func,
  iconOverlay: PropTypes.object,
  varBag: PropTypes.object,
};

TaskDocItem.defaultProps = {
  showIcon: true,
  showCreatedAt: false,
  varBag: {},
  onChange: () => { },
  onDelete: () => { },
  onLoading: () => { },
}

