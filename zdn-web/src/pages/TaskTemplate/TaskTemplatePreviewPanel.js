import { Typography, Form, Divider } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import FormBuilder from 'antd-form-builder'
import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';
import PropTypes from 'prop-types';

const { Title, Paragraph } = Typography;


const Container = styled.div`
  // margin: 0 auto 0 auto;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  // height: 100%;
`;


const convertTaskTemplateFieldsToFormFieldsSchema = (ttFields, official) => {
  return ttFields
    .filter(t => !!t.official === official)
    .map(t => {
      const widgetDef = TaskTemplateWidgetDef.find(x => x.type === t.type);
      return {
        key: t.name,
        label: t.name,
        name: t.name,
        required: t.required,
        extra: t.description,
        options: t.options,
        forwardRef: t.forwardRef,
        widget: widgetDef.widget,
        widgetProps: widgetDef.widgetPorps
      }
    });
}

export const TaskTemplatePreviewPanel = props => {

  const { value, type, debug } = props;

  const [clientFieldSchema, setClientFieldSchema] = React.useState(value);
  const [agentFieldSchema, setAgentFieldSchema] = React.useState(value);
  const previewFormRef = React.createRef();

  const officialMode = type === 'agent';

  React.useEffect(() => {
    const clientFields = convertTaskTemplateFieldsToFormFieldsSchema(value.fields, false);
    setClientFieldSchema(clientFields);
    const agentFields = convertTaskTemplateFieldsToFormFieldsSchema(value.fields, true);
    setAgentFieldSchema(agentFields);
  }, [value]);

  return (
    <Container style={props.style}>
      <Title level={3}>{value.name}</Title>
      <Paragraph type="secondary">{value.description}</Paragraph>
      <Divider style={{ marginTop: 4 }} />
      <Form
        ref={previewFormRef}
        layout="horizontal"
      >
        <FormBuilder meta={clientFieldSchema} form={previewFormRef} />
        {officialMode && <>
          <Title level={5} type="secondary" style={{ marginTop: 40 }}>Official only fields</Title>
          <Divider style={{ marginTop: 4 }} />
          <FormBuilder meta={agentFieldSchema} form={previewFormRef} />
        </>}
      </Form>
      {debug && <pre><small>{JSON.stringify(clientFieldSchema, null, 2)}</small></pre>}
    </Container >
  );
};

TaskTemplatePreviewPanel.propTypes = {
  value: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['client', 'agent']).isRequired,
  debug: PropTypes.bool.isRequired
};

TaskTemplatePreviewPanel.defaultProps = {
  type: 'client',
  debug: false
};

export default withRouter(TaskTemplatePreviewPanel);
