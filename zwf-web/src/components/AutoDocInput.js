
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Typography, Row, Col, Tooltip, Space } from 'antd';
import { getDocTemplate$ } from 'services/docTemplateService';
import { Loading } from './Loading';
import { finalize } from 'rxjs/operators';
import { FileAddFilled, SyncOutlined } from '@ant-design/icons';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
import { showDocTemplatePreviewModal } from './showDocTemplatePreviewModal';
import { VarTag } from './VarTag';
import { generateAutoDoc$ } from 'services/taskService';
import { FileIcon } from './FileIcon';
import { TaskFileName } from './TaskFileName';
import styled from 'styled-components';
import { FaSignature } from 'react-icons/fa';
import { showSignTaskFileModal } from './showSignTaskFileModal';
import { useRole } from 'hooks/useRole';

const { Link, Paragraph } = Typography;

const Container = styled.div`
border: 1px solid #D9D9D9;
border-radius: 4px;
width: 100%;
padding: 4px 12px 8px;
background-color: white;

&.disabled {
  background-color: rgb(245, 245, 245);
}
`;

export const AutoDocInput = (props) => {
  const { value, mode, fieldId, onChange, disabled } = props;
  const { docTemplateId } = value || {};

  const [loading, setLoading] = React.useState(!!docTemplateId);
  const [docTemplate, setDocTemplate] = React.useState({});

  const role = useRole();

  const isClient = role === 'client';

  React.useEffect(() => {
    if (docTemplateId) {
      const sub$ = getDocTemplate$(docTemplateId)
        .pipe(
          finalize(() => setLoading(false))
        )
        .subscribe(d => {
          setDocTemplate(d);
        });
      return () => sub$.unsubscribe();
    }
  }, [docTemplateId]);

  const handlePreview = () => {
    showDocTemplatePreviewModal(docTemplate, { allowTest: true });
  }

  if (!docTemplateId) {
    return 'docTemplate is not specified';
  }

  const hasGenerated = !!value.fileId;
  const canGenerateDoc = !hasGenerated && !isClient && !value.signedAt;
  const canRegenerateDoc = hasGenerated && !isClient && !value.signedAt;
  const canRequestSign = hasGenerated && !isClient && !value.signedAt;
  const canClientSign = isClient && value.requiresSign && !value.signedAt

  const handleGenerateDoc = () => {
    setLoading(true);
    generateAutoDoc$(fieldId).pipe(
      finalize(() => setLoading(false))
    ).subscribe((result) => {
      onChange({
        ...value,
        ...result,
      })
    })
  }

  const handleToggleRequireSign = () => {
    onChange({
      ...value,
      requiresSign: !value.requiresSign
    });
  }

  const handleSignTaskDoc = () => {
    showSignTaskFileModal(value, {
      onOk: () => {
        value.signedAt = new Date();
        onChange({ ...value });
      },
    })
  }

  const isForTaskTemplate = mode === 'taskTemplate';
  const canAction = !isForTaskTemplate && !disabled;

  return <Loading loading={loading}>
    <Container className={disabled ? 'disabled' : ''}>
      <Row wrap={false} align="top" justify="space-between" style={{ marginTop: 8 }}>
        {hasGenerated ? <Col>
          <TaskFileName taskFile={value} />
        </Col> : <Col>
          {hasGenerated ? <TaskFileName taskFile={value} /> : <Space>
            <Link onClick={handlePreview}>
              {/* <DocTemplateIcon /> */}
              <Space>
                <FileIcon name={'.pdf'} type={isForTaskTemplate ? null : "pending"} />
                {docTemplate.name}
              </Space>
            </Link>
            {isForTaskTemplate &&
              <Link href={`/doc_template/${docTemplate.id}`} target="_blank">
                <Button type="link" icon={<Icon component={MdOpenInNew} />} />
              </Link>}
          </Space>}
        </Col>}
        {canAction && <Col>
          <Space size="small">
            {canClientSign && <Tooltip title="Sign this document">
              <Button
                type="primary"
                danger
                icon={<Icon component={FaSignature} />}
                onClick={handleSignTaskDoc}
              >Sign</Button>
            </Tooltip>}
            {canRequestSign && <Tooltip title={value.requiresSign ? 'Click to cancel the signature request' : 'Ask client to sign this doc'}>
              <Button shape="circle"
                type={value.requiresSign ? 'primary' : 'default'}
                icon={<Icon component={FaSignature} />}
                onClick={handleToggleRequireSign}
              />
            </Tooltip>}
            {canGenerateDoc && <Tooltip title="Generate document">
              <Button type="primary" shape="circle" icon={<FileAddFilled />} onClick={handleGenerateDoc}></Button>
            </Tooltip>}
            {canRegenerateDoc && <Tooltip title="Re-generate document">
              <Button type="primary" shape="circle" icon={<SyncOutlined />} onClick={handleGenerateDoc}></Button>
            </Tooltip>}
          </Space>
        </Col>}
      </Row>
      {/* <Button type="link" icon={<EyeOutlined/>}/> */}
      {/* <DocTemplatePreviewPanel value={docTemplate} /> */}
      {!disabled && <small>
        <Paragraph type="secondary" style={{ margin: '4px 0 0 0' }}>
          Depending on fields {docTemplate.refFieldNames?.map(f => <VarTag key={f}>{f}</VarTag>)}
        </Paragraph>
      </small>}
      {/* <em>{JSON.stringify(value, null, 2)}</em> */}
    </Container>
  </Loading>
}

AutoDocInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  fieldId: PropTypes.string,
  // mode: PropTypes.string,
  // disabled: PropTypes.bool,
};

AutoDocInput.propTypes = {
  onChange: () => { },
  disabled: false,
  // mode: 'task'
};
