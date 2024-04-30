
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Typography } from 'antd';
import * as moment from 'moment';
import { DocTemplatePreviewPanel } from './DocTemplatePreviewPanel';
import { saveDocTemplate, getDocTemplate$ } from 'services/docTemplateService';
import { Loading } from './Loading';
import { finalize } from 'rxjs/operators';
import { DocTemplateIcon } from './entityIcon';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
import { showDocTemplatePreviewModal } from './showDocTemplatePreviewModal';

const { Link } = Typography;

export const AutoDocInput = (props) => {
  const { value, mode } = props;
  const { docTemplateId } = value || {};

  const [loading, setLoading] = React.useState(!!docTemplateId);
  const [docTemplate, setDocTemplate] = React.useState({});

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

  return <Loading loading={loading}>
    <Link onClick={handlePreview}>
      <DocTemplateIcon />
      {docTemplate.name}
    </Link>
    {mode === 'taskTemplate' &&
      <Link href={`/doc_template/${docTemplate.id}`} target="_blank">
        <Button type="link" icon={<Icon component={MdOpenInNew } />} />
      </Link>}
    {/* <Button type="link" icon={<EyeOutlined/>}/> */}
    {/* <DocTemplatePreviewPanel value={docTemplate} /> */}
  </Loading>
}

AutoDocInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  // mode: PropTypes.string,
};

AutoDocInput.propTypes = {
  onChange: () => { },
  // mode: 'task'
};
