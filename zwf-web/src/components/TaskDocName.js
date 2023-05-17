import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Space, Typography } from 'antd';
import { FileIcon } from './FileIcon';
import { useDemplatePreviewModal } from './useDemplatePreviewModal';
import { openTaskDoc } from 'services/fileService';
import { Loading } from './Loading';

const { Link, Text } = Typography

export const TaskDocName = props => {
  const { taskDoc, showOverlay, allowDownload, onClick, strong, showDescription } = props;

  const { id, name, fileId, signedAt, signRequestedAt, type, demplateId } = taskDoc
  const [iconType, setIconType] = React.useState('default');
  const [description, setDescription] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [hasFile, setHasFile] = React.useState(!!fileId);
  const [openPreview, previewContextHolder] = useDemplatePreviewModal();

  React.useEffect(() => {
    if (showOverlay) {
      if (signedAt) {
        setIconType('signed')
        setDescription('client has signed')
      } else if (signRequestedAt) {
        setIconType('await-sign');
        setDescription('awaiting client to sign')
      } else if (!hasFile) {
        setIconType('pending');
        const x = taskDoc;
        debugger;
        setDescription('The doc is pending generation because not all dependency fields are filled')
      } else {
        setIconType('default')
        setDescription(null)
      }
    }
  }, [taskDoc, hasFile, showDescription]);

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
        <Space.Compact direction="vertical" size="small">
        <Text>{name}</Text>
        {description && <Text type="secondary"><small>{description}</small></Text>}
        </Space.Compact>
        <Loading loading={loading} size={14} />
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
  showDescription: PropTypes.bool,
};

TaskDocName.defaultProps = {
  showOverlay: true,
  allowDownload: true,
  strong: false,
  showDescription: false,
};
