import { Typography, Form, Divider } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import FormBuilder from 'antd-form-builder'
import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';
import PropTypes from 'prop-types';

const { Title, Paragraph, Text } = Typography;


const Container = styled.div`
  margin: 0 auto 0 auto;
  max-width: 600px;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  // height: 100%;
`;


export const DocTemplatePreviewPanel = props => {

  const { value, type, debug } = props;

  const [clientFieldSchema, setClientFieldSchema] = React.useState([]);
  const [agentFieldSchema, setAgentFieldSchema] = React.useState([]);
  const previewFormRef = React.createRef();

  const officialMode = type === 'agent';

  if(!value) {
    return null;
  }

  return (
    <Container style={props.style}>
      <Title level={3}>{value.name}</Title>
      <p type="secondary">{value.description}</p>
      <Divider style={{ marginTop: 4 }} />
      <pre><small>{JSON.stringify(value.html, null, 2)}</small></pre>
      {debug && <pre><small>{JSON.stringify(clientFieldSchema, null, 2)}</small></pre>}
    </Container >
  );
};

DocTemplatePreviewPanel.propTypes = {
  value: PropTypes.object,
  type: PropTypes.oneOf(['client', 'agent']).isRequired,
  debug: PropTypes.bool.isRequired
};

DocTemplatePreviewPanel.defaultProps = {
  type: 'client',
  debug: false
};

export default withRouter(DocTemplatePreviewPanel);
