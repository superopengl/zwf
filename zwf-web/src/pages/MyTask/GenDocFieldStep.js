import { Space, Typography, Input, Form } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { varNameToLabelName } from 'util/varNameToLabelName';
import StepButtonSet from './StepBottonSet';


const { Paragraph, Title } = Typography;


const GenDocFieldStep = props => {
  const { doc, variableDic, onFinish, onBack, isActive } = props;
  const { refFields, docTemplateName, docTemplateDescription } = doc;

  const [initialValues, setInitialValues] = React.useState({});

  React.useEffect(() => {
    const initialValues = refFields.filter(x => x.name !== 'now').reduce((pre, cur) => {
      pre[cur.name] = cur.value || variableDic[cur.name];
      return pre;
    }, {});
    setInitialValues(initialValues);
  }, [variableDic]);

  const handleSubmit = async values => {
    doc.refFields.forEach(x => {
      x.value = values[x.name];
    });
    onFinish(values);
  };


  if (!isActive) {
    return null;
  }

  console.log('initialValues', initialValues);
  console.log('variableDic', variableDic);

  return <>
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>{docTemplateName}</Title>
      {docTemplateDescription && <Paragraph type="secondary">{docTemplateDescription}</Paragraph>}
      <Form
        layout="vertical"
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 16 }}
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        {Object.keys(initialValues).map((name, i) => <Form.Item label={varNameToLabelName(name)} name={name} key={i} rules={[{ required: true, message: ' ' }]}>
          <Input allowClear autoFocus={i === 0}/>
        </Form.Item>)}
      <StepButtonSet onBack={onBack} />

      </Form>
    </Space>
  </>
}

GenDocFieldStep.propTypes = {
  doc: PropTypes.any.isRequired,
  variableDic: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
};

GenDocFieldStep.defaultProps = {
  disabled: false,
  variableDic: {},
};

export default GenDocFieldStep;