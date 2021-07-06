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


const convertTaskTemplateFieldsToFormFieldsSchema = (ttFields) => {
  return ttFields.map(t => {
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

  const {value, debug} = props;

  const [fieldSchema, setFieldSchema] = React.useState(value);
  const previewFormRef = React.createRef();

  React.useEffect(() => {
    const filedSchema = convertTaskTemplateFieldsToFormFieldsSchema(value.fields);
    setFieldSchema(filedSchema);
  }, [value]);

  return (
    <Container style={props.style}>
      <Title level={3}>{value.name}</Title>
      <Paragraph type="secondary">{value.description}</Paragraph>
      <Divider />
      <Form
        ref={previewFormRef}
        layout="vertical"
      >
        <FormBuilder meta={fieldSchema} form={previewFormRef} />
      </Form>
      {debug && <pre><small>{JSON.stringify(fieldSchema, null, 2)}</small></pre>}
    </Container >
  );
};

TaskTemplatePreviewPanel.propTypes = {
  value: PropTypes.object.isRequired,
  debug: PropTypes.bool.isRequired
};

TaskTemplatePreviewPanel.defaultProps = {
  debug: false
};

export default withRouter(TaskTemplatePreviewPanel);
