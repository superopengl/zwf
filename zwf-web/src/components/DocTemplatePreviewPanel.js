import { Typography, Form, Divider, Input, Card, Button } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import FormBuilder from 'antd-form-builder'
import PropTypes from 'prop-types';
import {RawHtmlDisplay} from 'components/RawHtmlDisplay';
import { extractVarsFromDocTemplateBody } from 'util/extractVarsFromDocTemplateBody';
import { renderDocTemplateBodyWithVarBag } from 'util/renderDocTemplateBodyWithVarBag';
import { isEmpty } from 'lodash';

const { Title, Paragraph, Text } = Typography;


const Container = styled.div`
  margin: 0;
  // max-width: 600px;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  // height: 100%;
`;

const StyledCard = styled(Card)`
// box-shadow: 0 1px 2px rgba(0,0,0,0.1);
.ant-card-body, .ant-card-head {
  background-color: rgba(0,0,0,0.05);
  // padding: 16px;
}
`;

const PreviewDocContainer = styled.div`
background-color: rgba(0,0,0,0.05);
padding: 2rem;
`;

const PreviewDocPage = styled.div`
background-color: rgba(255,255,255);
padding: 1rem;
box-shadow: 0 5px 10px rgba(0,0,0,0.1);
`;

const getInitState = (html, initVarBag) => {
  const { vars, invalidVars } = extractVarsFromDocTemplateBody(html);
  const varBag = vars.reduce((pre, cur) => {
    pre[cur] = '';
    return pre;
  }, {});

  if (initVarBag) {
    for (const k in varBag) {
      varBag[k] = initVarBag[k];
    }
  }

  return {
    varBag,
    invalidVars,
    html,
    rendered: renderDocTemplateBodyWithVarBag(html, varBag)
  }
}

export const DocTemplatePreviewPanel = props => {

  const { value: docTemplate, type, debug } = props;

  const [clientFieldSchema, setClientFieldSchema] = React.useState([]);
  const [agentFieldSchema, setAgentFieldSchema] = React.useState([]);
  const [html, setHtml] = React.useState('');
  const [vars, setVars] = React.useState([]);
  const [invalidVars, setInvalidVars] = React.useState([]);
  const form = React.createRef();

  const reducer = (state, action) => {
    switch (action.type) {
      case 'setValue':
        const varBag = {
          ...state.varBag,
          ...action.value
        };
        return {
          ...state,
          varBag,
          rendered: renderDocTemplateBodyWithVarBag(state.html, varBag)
        }
      case 'load':
        const oldVarBag = state.varBag;
        const html = action.value;
        const newState = getInitState(html, oldVarBag);
        return newState;
      case 'reset': {
        form.current?.resetFields();
        return getInitState(state.html);
      }
      default:
        return state;
    }
  }

  const [state, dispatch] = React.useReducer(reducer, getInitState(docTemplate?.html));

  const officialMode = type === 'agent';

  React.useEffect(() => {
    if (docTemplate) {
      dispatch({ type: 'load', value: docTemplate.html });
    }
  }, [docTemplate]);

  const handleVarValueChange = (changedValue, allValues) => {
    dispatch({ type: 'setValue', value: changedValue });
  }

  const handleResetVarBag = () => {
    dispatch({ type: 'reset' });
  }
  return (
    <Container style={props.style}>
      {!isEmpty(state.varBag) && <StyledCard title="Test by setting variables" size="small" style={{ marginBottom: 30 }}
        extra={<Button type="link" onClick={handleResetVarBag}>reset</Button>}
      // size="small"
      >
        <Form
          ref={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onValuesChange={handleVarValueChange}
        >
          {Object.entries(state.varBag || {}).map(([k, v]) => <Form.Item key={k} label={k} name={k}>
            <Input placeholder="var value" />
          </Form.Item>)}
        </Form>
      </StyledCard>}
      <PreviewDocContainer>
        <Title level={3} style={{ textAlign: 'center' }}>{docTemplate?.name}</Title>
        <Paragraph type="secondary" style={{ textAlign: 'center' }}>{docTemplate?.description}</Paragraph>
        <PreviewDocPage>
          <RawHtmlDisplay value={state.rendered} />
        </PreviewDocPage>
      </PreviewDocContainer>
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

