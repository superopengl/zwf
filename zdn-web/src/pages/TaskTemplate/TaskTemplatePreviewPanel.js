import { Typography, Form, Divider } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import FormBuilder from 'antd-form-builder'
import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';
import PropTypes from 'prop-types';

const { Title, Paragraph } = Typography;


const Container = styled.div`
  margin: 0 auto 0 auto;
  max-width: 600px;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  // height: 100%;
`;


const convertTaskTemplateFieldsToFormFieldsSchema = (ttFields, official) => {
  return ttFields
    .map((t, i) => {
      if(!!t.official !== official) return null;
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

export const TaskTemplatePreviewPanel = props => {

  const { value, type, debug } = props;

  const [clientFieldSchema, setClientFieldSchema] = React.useState([]);
  const [agentFieldSchema, setAgentFieldSchema] = React.useState([]);
  const previewFormRef = React.createRef();

  const officialMode = type === 'agent';

  React.useEffect(() => {
    if(!value) return;
    const clientFields = convertTaskTemplateFieldsToFormFieldsSchema(value.fields, false);
    setClientFieldSchema(clientFields);
    const agentFields = convertTaskTemplateFieldsToFormFieldsSchema(value.fields, true);
    setAgentFieldSchema(agentFields);
  }, [value]);

  if(!value) {
    return null;
  }

  return (
    <Container style={props.style}>
      <Title level={3}>{value.name}</Title>
      <Paragraph type="secondary">{value.description}</Paragraph>
      <Divider style={{ marginTop: 4 }} />
      <Form
        ref={previewFormRef}
        layout="horizontal"
        colon={false}
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
