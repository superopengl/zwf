import { Typography, Divider } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { TaskFormWidget } from 'components/TaskFormWidget';

const { Title } = Typography;

const Container = styled.div`
  margin: 0 auto 0 auto;
  // max-width: 600px;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  // height: 100%;
`;


export const TaskTemplatePreviewPanel = props => {

  const { value: taskTemplate, type } = props;

  if (!taskTemplate) {
    return null;
  }

  return (
    <Container style={props.style}>
      <Title level={3}>{taskTemplate.name}</Title>
      <p type="secondary">{taskTemplate.description}</p>
      <Divider style={{ marginTop: 4 }} />
        <TaskFormWidget
          fields={taskTemplate.fields}
          type={type}
          mode="create"
        />
    </Container >
  );
};

TaskTemplatePreviewPanel.propTypes = {
  value: PropTypes.object,
  type: PropTypes.oneOf(['client', 'agent']).isRequired,
};

TaskTemplatePreviewPanel.defaultProps = {
  type: 'client',
};

export default withRouter(TaskTemplatePreviewPanel);
