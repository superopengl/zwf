import { Typography, Form, Divider, Button, Space } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import FormBuilder from 'antd-form-builder'
import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';
import PropTypes from 'prop-types';
import { PageContainer } from '@ant-design/pro-layout';

const { Title, Paragraph, Text } = Typography;


const Container = styled.div`
  margin: 0 auto 0 auto;
  max-width: 1000px;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  // height: 100%;
`;


const convertTaskTemplateFieldsToFormFieldsSchema = (ttFields, official) => {
  return ttFields
    .map((t, i) => {
      if (!!t.official !== official) return null;
      const widgetDef = TaskTemplateWidgetDef.find(x => x.type === t.type);
      const name = t.name || `Unnamed (field ${i + 1})`;
      return {
        key: name,
        label: name,
        name: name,
        required: t.required,
        extra: t.description,
        options: t.options,
        forwardRef: t.forwardRef,
        widget: widgetDef.widget,
        widgetProps: widgetDef.widgetPorps
      }
    })
    .filter(t => t);

}

export const TaskFormPanel = props => {

  const { value, type, debug, loading: propLoading } = props;

  const [clientFieldSchema, setClientFieldSchema] = React.useState([]);
  const [agentFieldSchema, setAgentFieldSchema] = React.useState([]);
  const [loading, setLoading] = React.useState(propLoading);
  const previewFormRef = React.createRef();

  const officialMode = type === 'agent';

  React.useEffect(() => {
    setLoading(propLoading);
  }, [propLoading]);

  React.useEffect(() => {
    if (!value) return;
    const clientFields = convertTaskTemplateFieldsToFormFieldsSchema(value.fields, false);
    setClientFieldSchema(clientFields);
    const agentFields = convertTaskTemplateFieldsToFormFieldsSchema(value.fields, true);
    setAgentFieldSchema(agentFields);
  }, [value]);

  if (!value) {
    return null;
  }

  const handleSubmit = () => {
    previewFormRef.current.submit();
  } 

  const handleReset = () => {
    previewFormRef.current.resetFields();
  }

  const handleFormSave = (values) => {
    props.onSave(values);
  }

  return (
    <Container style={props.style}>
      <PageContainer
        loading={loading}
        header={{
          title: value?.name || 'Loading'
        }}
        // content={<Paragraph type="secondary">{value.description}</Paragraph>}
        extra={[
          <Button key="reset" onClick={handleReset}>Reset</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Submit</Button>
        ]}
        footer={[
          <Button key="reset" onClick={handleReset}>Reset</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Submit</Button>
        ]}
      >
        <Form
          ref={previewFormRef}
          layout="horizontal"
          colon={false}
          onFinish={handleFormSave}
        >
          <FormBuilder meta={clientFieldSchema} form={previewFormRef} />
          {officialMode && <>
            <Title level={5} type="secondary" style={{ marginTop: 40 }}>Official only fields</Title>
            <Divider style={{ marginTop: 4 }} />
            <FormBuilder meta={agentFieldSchema} form={previewFormRef} />
          </>}
        </Form>
      </PageContainer>
      {debug && <pre><small>{JSON.stringify(clientFieldSchema, null, 2)}</small></pre>}
    </Container >
  );
};

TaskFormPanel.propTypes = {
  value: PropTypes.object,
  type: PropTypes.oneOf(['client', 'agent']).isRequired,
  loading: PropTypes.bool.isRequired,
  debug: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
};

TaskFormPanel.defaultProps = {
  type: 'client',
  loading: true,
  debug: false,
  onSave: () => { debugger; }
};

export default withRouter(TaskFormPanel);
