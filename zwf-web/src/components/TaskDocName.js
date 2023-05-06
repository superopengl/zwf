import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Space, Typography } from 'antd';
import { FileIcon } from './FileIcon';
import { useDocTemplatePreviewModal } from './showDocTemplatePreviewModal';
import { openTaskDoc } from 'services/fileService';
import { Loading } from './Loading';

const { Link, Text } = Typography

export const TaskDocName = props => {
  const { taskDoc, showOverlay, allowDownload, onClick, strong } = props;

  const { id, name, fileId, signedAt, signRequestedAt, type, demplateId } = taskDoc
  const [iconType, setIconType] = React.useState('default');
  const [loading, setLoading] = React.useState(false);
  const [hasFile, setHasFile] = React.useState(!!fileId);
  const [openPreview, previewContextHolder] = useDocTemplatePreviewModal();

  React.useEffect(() => {
    if (showOverlay) {
      if (signedAt) {
        setIconType('signed')
      } else if (signRequestedAt) {
        setIconType('await-sign');
      } else if (!hasFile) {
        setIconType('pending');
      } else {
        setIconType('default')
      }
    }
  }, [taskDoc, hasFile]);

  const handleOpenTaskDoc = async (e) => {
    onClick?.();
    if (!allowDownload) {
      return;
    }
    e.stopPropagation();
    if (loading) {
      return;
    }
    setLoading(true)
    try {
      const exists = await openTaskDoc(id, name);
      if (!exists && demplateId) {
        openPreview(demplateId, name);
      }
      setHasFile(exists);
    } finally {
      setLoading(false);
    }
  }

  return <>
    <Link onClick={handleOpenTaskDoc} strong={strong}>
      <Space>
        <FileIcon name={name} type={iconType} />
        {name} <Loading loading={loading} size={14} />
      </Space>
    </Link>
    {previewContextHolder}
  </>
}

TaskDocName.propTypes = {
  taskDoc: PropTypes.shape({
    fileId: PropTypes.string,
    demplateId: PropTypes.string,
    name: PropTypes.string.isRequired,
  }),
  showOverlay: PropTypes.bool,
  allowDownload: PropTypes.bool,
  strong: PropTypes.bool,
  onClick: PropTypes.func,
};

TaskDocName.defaultProps = {
  showOverlay: true,
  allowDownload: true,
  strong: false,
};
