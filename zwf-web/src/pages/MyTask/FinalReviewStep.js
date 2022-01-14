import { Button, Divider, Alert, Space, Typography, Popover } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { varNameToLabelName } from 'util/varNameToLabelName';
import FileLink from 'components/FileLink';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { LeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;


const PopoverContent = styled.div`
  max-width: 500px;
`;

const TaskReviewItem = props => {
  const { text, description, value } = props;
  return <Space style={{ width: '100%', justifyContent: 'space-between' }}>
    {text && <Text strong>{varNameToLabelName(text)}</Text>}
    {value}
    {description && <Popover
      title={text}
      content={<PopoverContent>{description}</PopoverContent>}
      trigger="click"
    >
      <Button type="link" style={{position: 'relative', top: 4}} icon={<BsFillInfoCircleFill size={20} style={{ fill: '#183e91' }} />} />
    </Popover>}
  </Space>
}

const PartDivider = props => <Divider><Text type="secondary">{props.text}</Text></Divider>

const FinalReviewStep = props => {
  const { task, onFinish, onBack, isActive, showsFooter } = props;

  const handleSave = async () => {
    onFinish();
  };


  if (isActive === false) {
    return null;
  }

  const supportDocs = task.docs?.filter(d => !d.isFeedback) || [];
  const feedbackDocs = task.docs?.filter(d => d.isFeedback) || [];

  return <>
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>{task.name}</Title>
      {task.docTemplateDescription && <Alert description={task.docTemplateDescription} type="warning" closable />}
      {task.fields.length > 0 && <>
        <PartDivider text="Fields" />
        {task.fields.map((field, i) => {
          const { name, description, value } = field;
          return <TaskReviewItem key={i} text={varNameToLabelName(name)} description={description} value={value} />
        })}
      </>}
      {supportDocs.length > 0 && <>
        <PartDivider text="Support Documents" />
        {supportDocs.map((doc, i) => {
          const { docTemplateDescription, fileId, fileName } = doc;
          return <TaskReviewItem key={i} description={docTemplateDescription} value={<FileLink id={fileId} name={fileName} />}
          />
        })}
      </>}
      {feedbackDocs.length > 0 && <>
        <PartDivider text="Feedback Documents" />
        {feedbackDocs.map((doc, i) => {
          const { docTemplateDescription, fileId, fileName } = doc;
          return <TaskReviewItem key={i} description={docTemplateDescription} value={<FileLink id={fileId} name={fileName} />}
          />
        })}
      </>}
      {showsFooter && <>
        <Divider />
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button shape="circle" size="large" onClick={() => onBack()} icon={<LeftOutlined />}></Button>
          <Button onClick={handleSave} type="primary">Save and Submit</Button>
        </Space>
      </>}
    </Space>
  </>
}

FinalReviewStep.propTypes = {
  task: PropTypes.any.isRequired,
  showsFooter: PropTypes.bool,
  showsSignDoc: PropTypes.bool,
};

FinalReviewStep.defaultProps = {
  showsFooter: true,
  showsSignDoc: true,
};

export default FinalReviewStep;