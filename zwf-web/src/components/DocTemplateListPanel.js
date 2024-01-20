import React from 'react';
import PropTypes from 'prop-types';
import { Badge, List, Typography, Tooltip } from 'antd';
import { DocTemplateIcon } from 'components/entityIcon';
import styled from 'styled-components';
import { getDocTemplate$ } from 'services/docTemplateService';
import { showDocTemplatePreviewModal } from './showDocTemplatePreviewModal';
import { VarTag } from './VarTag';
import { ExclamationCircleFilled } from '@ant-design/icons';

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
  const { value: docs, allowTest, varBag, showWarning, renderVariable, ...otherProps } = props;

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
    renderItem={doc => {
      const missingVarComps = (doc.variables ?? []).filter(v => varBag[v] === undefined || varBag[v] === '').map(v => renderVariable(v));
      return <DocListItem onClick={() => handlePreviewDocTemplate(doc.id)}>
        <div><DocTemplateIcon /><Text>{doc.name}</Text>
          {showWarning && missingVarComps.length > 0 && <>
            <Tooltip title={<>Fields {missingVarComps} are required to be input to generate the doc.</>}>
              <ExclamationCircleFilled style={{ color: '#cf1322', marginLeft: 4, fontSize: 18 }} />
            </Tooltip>
          </>}
        </div>
      </DocListItem>
    }}
  />
};

DocTemplateListPanel.propTypes = {
  value: PropTypes.array,
  allowTest: PropTypes.bool,
  showWarning: PropTypes.bool,
  varBag: PropTypes.object,
  renderVariable: PropTypes.func,
};

DocTemplateListPanel.defaultProps = {
  value: null,
  allowTest: false,
  showWarning: false,
  varBag: {},
  renderVariable: (varName) => <VarTag>{varName}</VarTag>
};

