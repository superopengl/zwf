
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Typography, Row, Col, Tooltip, Space } from 'antd';
import * as moment from 'moment';
import { DocTemplatePreviewPanel } from './DocTemplatePreviewPanel';
import { saveDocTemplate, getDocTemplate$ } from 'services/docTemplateService';
import { Loading } from './Loading';
import { finalize } from 'rxjs/operators';
import { DocTemplateIcon } from './entityIcon';
import { EditOutlined, EyeOutlined, FileAddFilled, FileAddOutlined } from '@ant-design/icons';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
import { showDocTemplatePreviewModal } from './showDocTemplatePreviewModal';
import { VarTag } from './VarTag';
import { generateAutoDoc$, getTaskDocDownloadUrl } from 'services/taskService';
import { FileIcon } from './FileIcon';

const { Link, Paragraph } = Typography;

export const AutoDocInput = (props) => {
  const { value, mode, fieldId } = props;
  const { docTemplateId } = value || {};
  const form = Form.useFormInstance();

  const [loading, setLoading] = React.useState(!!docTemplateId);
  const [docTemplate, setDocTemplate] = React.useState({});

  const validateMissingSiblingFields = () => {
    const allFields = form.getFieldsValue();
  }

  // React.useEffect(() => {
  //   const allFields = form.getFieldsValue();
  //   debugger;
  // });

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

  const handleGenerateDoc = () => {
    setLoading(true);
    generateAutoDoc$(fieldId).subscribe(() => {
      setLoading(false);
    })
  }

  return <Loading loading={loading}>
    <Row wrap={false} align="top" justify="space-between">
      {hasGenerated ? <Col>
        <Link href={getTaskDocDownloadUrl(value.fileId)} target="_blank">
          {/* <DocTemplateIcon /> */}
          <Space>
            <FileIcon name={'.pdf'} />
            {docTemplate.name}
          </Space>
        </Link>
      </Col> : <Col>
        <Link onClick={handlePreview}>
          {/* <DocTemplateIcon /> */}
          <Space>
            <FileIcon name={'.pdf'} />
            {docTemplate.name}
          </Space>
        </Link>
        {mode === 'taskTemplate' &&
          <Link href={`/doc_template/${docTemplate.id}`} target="_blank">
            <Button type="link" icon={<Icon component={MdOpenInNew} />} />
          </Link>}
      </Col>}
      <Col>
        <Tooltip title="Generate document">
          <Button type="primary" shape="circle" icon={<FileAddFilled />} onClick={handleGenerateDoc}></Button>
        </Tooltip>
      </Col>
    </Row>
    {/* <Button type="link" icon={<EyeOutlined/>}/> */}
    {/* <DocTemplatePreviewPanel value={docTemplate} /> */}
    <Paragraph>
      {docTemplate.refFields?.map(f => <VarTag key={f}>{f}</VarTag>)}
    </Paragraph>
    <em>{JSON.stringify(value, null, 2)}</em>
  </Loading>
}

AutoDocInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  fieldId: PropTypes.string,
  // mode: PropTypes.string,
};

AutoDocInput.propTypes = {
  onChange: () => { },
  // mode: 'task'
};
