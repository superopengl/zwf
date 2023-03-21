import React from 'react';
import PropTypes from 'prop-types';
import { Badge, List, Typography, Tooltip, Row, Col, Space } from 'antd';
import { DocTemplateIcon } from 'components/entityIcon';
import styled from 'styled-components';
import { getDocTemplate$ } from 'services/docTemplateService';
import { showDocTemplatePreviewModal } from './showDocTemplatePreviewModal';
import { VarTag } from './VarTag';
import { ExclamationCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { getPublicFileUrl } from 'services/fileService';

const { Text, Link: TextLink } = Typography;

const DocListItem = styled(List.Item)`
padding-left: 12px !important;
padding-right: 12px !important;
display: flex;
flex-direction: column;
position: relative;

.docItem {
  width: 100%;
  align-items: center;
}

&:hover {
  cursor: pointer;
  background-color: #F5F5F5;

  .docItem:after {
    content: "click to view";
    color: #0FBFC4;
  }
}
`;

export const DocTemplateListPanel = (props) => {
  const { value: docs, allowTest, varBag, showWarning, renderVariable, mode, ...otherProps } = props;

  const handlePreviewDocTemplate = (e, docId) => {
    e.stopPropagation();
    getDocTemplate$(docId).subscribe(docTemplate => {
      showDocTemplatePreviewModal(docTemplate, { allowTest, varBag });
    })
  }

  const isDocTemplateMode = mode === 'create'

  return docs?.length > 0 && <List
    size="small"
    bordered
    {...otherProps}
    rowKey="id"
    dataSource={docs}
    renderItem={doc => {
      const missingVarComps = (doc.refFieldNames ?? []).filter(v => varBag[v] === undefined || varBag[v] === '').map(v => <span key={v}>{renderVariable(v)}</span>);
      return <DocListItem onClick={isDocTemplateMode ? (e) => handlePreviewDocTemplate(e, doc.id) : null}>
        {isDocTemplateMode
          ? <Row justify="space-between" className="docItem">
            <Col><Space size="small"><DocTemplateIcon /><Text>{doc.name}</Text></Space></Col>
          </Row>
          : <TextLink href={getPublicFileUrl(doc.fileId)} target="_blank" style={{ width: '100%' }}>
            <Row justify="space-between" className="docItem">
              <Col><Space size="small"><DocTemplateIcon /><Text>{doc.name}</Text></Space></Col>
            </Row>
          </TextLink>}
        {showWarning && <Tooltip title={<>Fields {missingVarComps} are required to be input to generate the doc.</>}
          placement="topLeft"
          overlayStyle={{ maxWidth: 398 }}
          arrowPointAtCenter>
          <ExclamationCircleOutlined style={{
            color: '#cf1322',
            marginRight: 4,
            fontSize: 18,
            visibility: missingVarComps.length > 0 ? 'visible' : 'hidden',
            position: 'absolute',
            left: -30,
          }}
          />
        </Tooltip>}
        {/* {showWarning && missingVarComps.length > 0 && <Text style={{marginTop: 10, lineHeight: 0.8, fontSize: '0.8rem'}} type="danger">Fields {missingVarComps} are required for this doc.</Text>} */}
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
  mode: PropTypes.oneOf(['create', 'edit']),
};

DocTemplateListPanel.defaultProps = {
  value: null,
  allowTest: false,
  showWarning: false,
  varBag: {},
  renderVariable: (varName) => <VarTag>{varName}</VarTag>,
  mode: 'create',
};

