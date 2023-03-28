import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Space, Typography } from 'antd';
import { FileIcon } from './FileIcon';
import { useDocTemplatePreviewModal } from './showDocTemplatePreviewModal';
import { openTaskDoc } from 'services/fileService';
import { Loading } from './Loading';

const { Link } = Typography

export const TaskDocName = props => {
  const { taskDoc, showOverlay } = props;

  const { id, name, fileId, signedAt, signRequestedAt, type, docTemplateId } = taskDoc
  const [loading, setLoading] = React.useState(false);
  const [openPreview, previewContextHolder] = useDocTemplatePreviewModal();

  let iconType = 'default';

  if (showOverlay) {
    if (signedAt) {
      iconType = 'signed'
    } else if (signRequestedAt) {
      iconType = 'await-sign';
    } else if (!fileId) {
      iconType = 'pending';
    }
  }

  const handleOpenTaskDoc = async (e) => {
    e.stopPropagation();
    if(loading) {
      return;
    }
    setLoading(true)
    try {
      const hasFile = await openTaskDoc(id, name);
      if (!hasFile && docTemplateId) {
        openPreview(docTemplateId, name);
      }
    } finally {
      setLoading(false);
    }
  }

  return <>
  <Link onClick={handleOpenTaskDoc}><Space>
    <FileIcon name={name} type={iconType} />
    {name} <Loading loading={loading} size={14}/>
  </Space>
  </Link>
  {previewContextHolder}
  </>
}

TaskDocName.propTypes = {
  taskDoc: PropTypes.shape({
    fileId: PropTypes.string,
    docTemplateId: PropTypes.string,
    name: PropTypes.string.isRequired,
  }),
  showOverlay: PropTypes.bool,
};

TaskDocName.defaultProps = {
  showOverlay: true,
};
