import React from 'react';
import PropTypes from 'prop-types';
import { List, Typography } from 'antd';
import { DocTemplateIcon } from 'components/entityIcon';
import styled from 'styled-components';
import { getDocTemplate$ } from 'services/docTemplateService';
import { showDocTemplatePreviewModal } from './showDocTemplatePreviewModal';

const { Text } = Typography;

const DocListItem = styled(List.Item)`
padding-left: 12px !important;
padding-right: 12px !important;

&:hover {
  cursor: pointer;
  background-color: #F5F5F5;

  &:after {
    content: "click to view";
    color: #8abcd1;
  }
}
`;

export const DocTemplateListPanel = (props) => {
  const { value: docs, allowTest, varBag, ...otherProps } = props;

  const handlePreviewDocTemplate = docId => {
    getDocTemplate$(docId).subscribe(docTemplate => {
      showDocTemplatePreviewModal(docTemplate, { allowTest, varBag });
    })
  }

  return docs?.length > 0 && <List
    size="small"
    bordered
    {...otherProps}
    rowKey="id"
    dataSource={docs}
    renderItem={doc => <DocListItem onClick={() => handlePreviewDocTemplate(doc.id)}>
      <div><DocTemplateIcon /><Text>{doc.name}</Text></div>
    </DocListItem>}
  />
};

DocTemplateListPanel.propTypes = {
  value: PropTypes.array,
  allowTest: PropTypes.bool,
  varBag: PropTypes.object,
};

DocTemplateListPanel.defaultProps = {
  value: null,
  allowTest: false,
  varBag: {},
};

