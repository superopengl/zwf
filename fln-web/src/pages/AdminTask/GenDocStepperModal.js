import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Form, Modal, Space, Typography, Spin } from 'antd';
import StepWizard from 'react-step-wizard';

import { varNameToLabelName } from 'util/varNameToLabelName';
import { getDocTemplate, genPdfFromDocTemplate, listDocTemplate } from 'services/docTemplateService';
import { Loading } from 'components/Loading';

const { Paragraph, Title } = Typography;

const GenDocStepperModal = props => {
  const { visible, fields, docTemplateId, onChange, onCancel } = props;
  const [loading, setLoading] = React.useState(true);
  const [docTemplateList, setDocTemplateList] = React.useState([]);
  const [docTemplate, setDocTemplate] = React.useState();
  const [initialValues, setInitialValues] = React.useState();
  const stepperRef = React.useRef(null);

  const loadList = async () => {
    setLoading(true);
    try {
      if (docTemplateId) {
        const docTemplate = await getDocTemplate(docTemplateId);
        setDocTemplate(docTemplate);
        handleChooseDocTemplate(docTemplate);
      } else {
        const list = await listDocTemplate();
        list.sort((a, b) => a.name.localeCompare(b.name));
        setDocTemplateList(list);
      }
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (visible) {
      loadList();
    }
  }, [visible]);

  const handleSubmit = async (values) => {
    setLoading(true);
    const pdfFile = await genPdfFromDocTemplate(docTemplate.id, values);
    setLoading(false);
    const doc = {
      docTemplateId: docTemplate.id,
      fileId: pdfFile.id,
      fileName: pdfFile.fileName,
      variables: Object.entries(values).map(([k, v]) => ({ name: k, value: v }))
    }
    onChange(doc);
  }

  const handleChooseDocTemplate = docTemplate => {
    setDocTemplate(docTemplate);
    const initialValues = docTemplate.variables.filter(x => x !== 'now').reduce((pre, cur) => {
      pre[cur] = fields.find(f => f.name === cur)?.value;
      return pre;
    }, {});
    setInitialValues(initialValues);
    stepperRef.current.nextStep();
  }

  const transitions = {
    enterRight: 'animate__fadeIn',
    enterLeft: 'animate__fadeIn',
    exitRight: 'animate__fadeIn',
    exitLeft: 'animate__fadeIn'
  }

  return <Modal
    visible={visible}
    title="Add Document from Doc Template"
    maskClosable={false}
    closable={true}
    destroyOnClose={true}
    onOk={onCancel}
    onCancel={onCancel}
    footer={null}
  >
    {visible && <Loading loading={loading}>
      <StepWizard ref={stepperRef} transitions={transitions}>
        <div>
          <Title level={4}>Choose a doc template</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            {docTemplateList.map((d, i) => <Button key={i} block size="large" onClick={() => handleChooseDocTemplate(d)}>{d.name}</Button>)}
          </Space>
        </div>
        <div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>{docTemplate?.name}</Title>
            {docTemplate?.description && <Paragraph type="secondary">{docTemplate.description}</Paragraph>}
            {initialValues && <Form
              layout="vertical"
              // labelCol={{ span: 8 }}
              // wrapperCol={{ span: 16 }}
              onFinish={handleSubmit}
              initialValues={initialValues}
            >
              {Object.keys(initialValues).map((name, i) => <Form.Item label={varNameToLabelName(name)} name={name} key={i} rules={[{ required: true, message: ' ' }]}>
                <Input allowClear autoFocus={i === 0} />
              </Form.Item>)}
              <Form.Item>
                <Button htmlType="submit" block type="primary">Generate Doc</Button>
              </Form.Item>
            </Form>}
          </Space>
        </div>
      </StepWizard>
    </Loading>}
  </Modal>
}

GenDocStepperModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  fields: PropTypes.array,
  docTemplateId: PropTypes.string,
};

GenDocStepperModal.defaultProps = {
  fields: []
};

export default GenDocStepperModal;