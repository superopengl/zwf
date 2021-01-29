import { Space, Typography, Spin } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { genPdfFromDocTemplate, getDocTemplate } from 'services/docTemplateService';
import 'react-markdown-editor-lite/lib/index.css';
import { computeVariablesHash } from 'util/computeVariableHash';
import FileLink from 'components/FileLink';
import StepButtonSet from './StepBottonSet';
import { Loading } from 'components/Loading';


const { Title, Paragraph } = Typography;


const GenDocLinkStep = props => {
  const { doc, variableDic, onFinish, onBack, isActive, skipLoading } = props;
  const [loading, setLoading] = React.useState(isActive);
  const [docTemplate, setDocTemplate] = React.useState();
  const [pdfFile, setPdfFile] = React.useState({
    id: doc.fileId,
    name: doc.fileName,
  });

  const { docTemplateId } = doc;

  const computeDocVarHash = (doc) => {
    const variables = doc.variables.filter(x => x.name !== 'now').reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    const varHash = computeVariablesHash(variables);
    return varHash;
  }

  const loadEntity = async () => {
    setLoading(true);
    const docTemplate = await getDocTemplate(doc.docTemplateId);
    setDocTemplate(docTemplate);
    const variables = (doc.variables || []).map(x => x.name).filter(x => x !== 'now').reduce((pre, cur) => {
      pre[cur] = variableDic[cur];
      return pre;
    }, {});
    const varHash = computeVariablesHash(variables);

    if (doc.varHash !== varHash) {
      const pdfData = await genPdfFromDocTemplate(docTemplateId, variables);
      setPdfFile(pdfData);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (isActive) {
      loadEntity();
    }
  }, [isActive]);


  const handleNext = () => {
    const genDoc = {
      ...doc,
      fileId: pdfFile.id,
      fileName: pdfFile.fileName,
      varHash: computeDocVarHash(doc),
    }
    onFinish(genDoc);
  }


  if (!isActive || !docTemplate) {
    return null;
  }

  const { name: docTemplateName, description: docTemplateDescription } = docTemplate;

  return <Loading loading={loading && !skipLoading}>
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>{docTemplateName}</Title>
      {docTemplateDescription && <Paragraph type="secondary">{docTemplateDescription}</Paragraph>}
      <FileLink placeholder={doc.fileName} id={pdfFile.id} name={pdfFile.fileName} location={pdfFile.location} />
      <StepButtonSet onBack={onBack} onNext={handleNext} loading={loading} />
    </Space>
  </Loading>
}

GenDocLinkStep.propTypes = {
  doc: PropTypes.any.isRequired,
  variableDic: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
  skipLoading: PropTypes.bool,
};

GenDocLinkStep.defaultProps = {
  disabled: false,
  variableDic: {},
  skipLoading: false
};

export default GenDocLinkStep;