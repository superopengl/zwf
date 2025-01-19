import { Typography, Divider , Alert} from 'antd';
import React from 'react';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import { TaskFormWidget } from 'components/TaskFormWidget';
import { TaskSchemaRenderer } from 'components/TaskSchemaRenderer';

const { Title, Paragraph } = Typography;

const Container = styled.div`
  // margin: 0 auto 0 auto;
  width: 100%;
  // max-width: 600px;
  background-color: #ffffff;
  // padding: 2rem;
  // height: calc(100vh - 64px);
  // height: 100%;
`;


export const TaskTemplatePreviewPanel = props => {

  const { value: taskTemplate, mode } = props;

  if (!taskTemplate) {
    return null;
  }

  return (
    <Container style={props.style}>
      <Title level={3}>{taskTemplate.name}</Title>
      {/* <Alert type="info" description={taskTemplate.description} showIcon /> */}
      <Paragraph>{taskTemplate.description}</Paragraph>
      <Divider/>
      <TaskSchemaRenderer
        fields={taskTemplate.fields}
        mode={mode}
      />
    </Container >
  );
};

TaskTemplatePreviewPanel.propTypes = {
  value: PropTypes.object,
  mode: PropTypes.oneOf(['client', 'agent']).isRequired,
};

TaskTemplatePreviewPanel.defaultProps = {
  mode: 'agent',
};

export default TaskTemplatePreviewPanel;
