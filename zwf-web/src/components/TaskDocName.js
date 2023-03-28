import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FileIcon as ReactFileIcon, defaultStyles } from 'react-file-icon';
import { Space, Typography, Tooltip } from 'antd';
import { CheckCircleFilled, CheckOutlined, ClockCircleOutlined, InfoCircleFilled } from '@ant-design/icons';
import Icon, { CheckCircleOutlined } from '@ant-design/icons';
import { BsFillPenFill } from 'react-icons/bs';
import { FileIcon } from './FileIcon';
import { getTaskDocDownloadUrl } from "services/taskService";
import { DebugJsonPanel } from './DebugJsonPanel';
import { useDocTemplatePreviewModal } from './showDocTemplatePreviewModal';
import { openTaskDoc } from 'services/fileService';

const { Link } = Typography

const StyledFileIcon = styled.div`
  position: relative;
  display: inline-block;

  .overlay {
    position: absolute;
    // background-color: white;
    bottom: 0;
    right: 0;
    opacity: 0.5;
  }
`;

export const TaskDocName = props => {
  const { taskFile, showOverlay } = props;

  const { id, name, fileId, signedAt, requiresSign, type, docTemplateId } = taskFile
  const [openPreview, previewContextHolder] = useDocTemplatePreviewModal();

  let iconType = 'default';

  if (showOverlay) {
    if (signedAt) {
      iconType = 'signed'
    } else if (requiresSign) {
      iconType = 'await-sign';
    } else if (!fileId) {
      iconType = 'pending';
    }
  }

  const innerContext = <Space>
    <FileIcon name={name} type={iconType} />
    {name}
  </Space>

  const handleOpenTaskDoc = async (e) => {
    e.stopPropagation();
    const hasFile = await openTaskDoc(id, name);
    if (!hasFile && docTemplateId) {
      openPreview(docTemplateId, name);
    } else {
      throw new Error('Cannot open task doc');
    }
  }

  return <>
  <Link onClick={handleOpenTaskDoc}><Space>
    <FileIcon name={name} type={iconType} />
    {name}
  </Space>
  </Link>
  {previewContextHolder}
  </>

  // return <>
  //   {fileId ? <Link href={getTaskDocDownloadUrl(fileId)} target="_blank">
  //     {innerContext}
  //   </Link> : docTemplateId ? <Link onClick={openDocTemplatePreview}>
  //     {innerContext}
  //   </Link> : innerContext}
  //   {previewContextHolder}
  // </>
}

TaskDocName.propTypes = {
  taskFile: PropTypes.shape({
    fileId: PropTypes.string,
    docTemplateId: PropTypes.string,
    name: PropTypes.string.isRequired,
  }),
  showOverlay: PropTypes.bool,
};

TaskDocName.defaultProps = {
  showOverlay: true,
};
