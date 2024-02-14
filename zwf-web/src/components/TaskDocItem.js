import React from 'react';
import styled from 'styled-components';

import PropTypes from 'prop-types';
import { Typography, Space, List, Tooltip, Tag, Checkbox, Button } from 'antd';
import { FileIcon } from './FileIcon';
import { TimeAgo } from './TimeAgo';
import { GlobalContext } from 'contexts/GlobalContext';
import { CheckOutlined, CheckSquareOutlined, BorderOutlined } from '@ant-design/icons'
import _ from 'lodash';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { BsPatchCheck } from 'react-icons/bs';
import { showSignTaskDocModal } from './showSignTaskDocModal';
import { FaFileSignature } from 'react-icons/fa';
import { genDoc$, getTaskDocDownloadUrl, toggleTaskDocsOfficialOnly$, toggleTaskDocsRequiresSign$ } from "services/taskDocService";
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { finalize } from 'rxjs/operators';
import DropdownMenu from './DropdownMenu';
import { MdBrightnessAuto } from 'react-icons/md';

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

  let color = '#cf222e';
  let tooltipMessage = 'The file is not generated yet. Fill in fields first.';
  if (taskDoc.fileId) {
    color = '#2da44e';
    tooltipMessage = 'The file has been generated.';
  }

  return <Tooltip title={tooltipMessage}>
    <Icon component={() => <MdBrightnessAuto />} style={{ color, fontSize: 20 }} />
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

  return missingVars;
}

export const TaskDocItem = React.memo(props => {
  const { taskDoc, showIcon, style, showCreatedAt, strong, onChange, onDelete, varBag, onLoading } = props;
  const context = React.useContext(GlobalContext);
  const { user, role } = context;

  const isClient = role === 'client';
  const isAgent = role === 'agent' || role === 'admin';

  const missingVars = React.useMemo(() => getMissingVarWarningMessage(taskDoc.variables, varBag), [taskDoc, varBag]);

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
    return !isClient && taskDoc.docTemplateId && !taskDoc.fileId && !missingVars.length
  }

  const handleToggleOfficialOnly = (taskDoc) => {
    const checked = !taskDoc.officialOnly;
    toggleTaskDocsOfficialOnly$(taskDoc.id, checked).subscribe(() => {
      onChange()
    })
  }

  const handleToggleRequireSign = (taskDoc) => {
    onLoading(true)
    const checked = !taskDoc.requiresSign;
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

  const handleDeleteDoc = (item) => {
    onDelete();
  }

  const handleGenDoc = (item) => {
    const taskDocId = item.id;
    onLoading(true)
    genDoc$(taskDocId).pipe(
      finalize(() => onLoading(false))
    ).subscribe(() => {
      onChange();
    });
  }

  const iconOverlay = getAutoDocTag(taskDoc, context.role);


  return <List.Item onClick={e => {
    e.stopPropagation();
  }}
    extra={<>
      {canClientSign(taskDoc) && <Button type="link" icon={<Icon component={() => <FaFileSignature />} />} onClick={(e) => handleSignTaskDoc(taskDoc, e)}>Sign</Button>}
      {!isClient && <DropdownMenu
        config={[
          {
            icon: taskDoc.requiresSign ? <CheckSquareOutlined /> : <BorderOutlined />,
            menu: 'Require client sign',
            onClick: () => handleToggleRequireSign(taskDoc)
          },
          {
            icon: taskDoc.officialOnly ? <CheckSquareOutlined /> : <BorderOutlined />,
            menu: 'Hide from client',
            onClick: () => handleToggleOfficialOnly(taskDoc),
            disabled: !canToggleOfficalOnly(taskDoc)
          },
          taskDoc.type === 'auto' ? {
            icon: <Icon component={() => <BsPatchCheck />} />,
            menu: 'Generate doc',
            onClick: () => handleGenDoc(taskDoc),
            disabled: !canGenDoc(taskDoc),
          } : null,
          canDelete(taskDoc) ? {
            icon: <Text type="danger"><DeleteOutlined /></Text>,
            menu: <Text type="danger">Delete</Text>,
            onClick: () => handleDeleteDoc(taskDoc)
          } : null,

        ].filter(x => x)}
      />}

    </>}
  >
    <List.Item.Meta
      avatar={<div style={{ position: 'relative' }}>
        <FileIcon name={taskDoc.name} />
        {iconOverlay && <div
          style={{ position: 'absolute', right: -6, top: -6 }}
        >{iconOverlay}</div>}
      </div>}
      title={<Link href={getTaskDocDownloadUrl(taskDoc.id)} target="_blank">{taskDoc.name}</Link>}
      description={<>
        {taskDoc.signedAt && <TimeAgo value={taskDoc.signedAt} prefix="Signed:" accurate={false} showTime={false} />}
        {showCreatedAt && taskDoc.createdAt && <div><TimeAgo value={taskDoc.createdAt} prefix="Created:" direction="horizontal" accurate={false} showTime={false} /></div>}
        {missingVars.length > 0 && <div style={{ marginTop: 4 }}>{missingVars.map(x => <div><Text type="danger">{x}</Text></div>)}</div>}
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

