import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Typography, Tag, Space, Alert } from 'antd';
import { TaskContext } from 'contexts/TaskContext';
import { ArrowLeftOutlined, ArrowRightOutlined, LeftOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';

const { Text, Paragraph } = Typography;

const ContainerText = styled(Text)`
margin-left: 36px;
positon: relative:
top: -10px;

&, .ant-typography, .ant-tag, .ant-alert-message {
  font-size: 0.8rem;
}

.ant-alert {
  padding: 8px;
}
`;

function analyzeTaskDocAndFields(taskDoc, taskFields) {
  const { fieldBag } = taskDoc;
  // No var to fill in this demplate.
  const blankVars = [];
  const filledVars = [];
  const valueChangedVars = {};
  if (fieldBag) {
    for (const field of taskFields) {
      const { name, value: valueInField } = field;
      if (name in fieldBag) {
        // Dependency field
        if (valueInField) {
          // The field has value already
          filledVars.push(name);
        } else {
          // The field is still blank.
          blankVars.push(name);
        }

        const valueInDoc = fieldBag[name];
        if (valueInDoc !== valueInField) {
          valueChangedVars[name] = {
            valueInDoc,
            valueInField,
          }
        }
      }
    }
  }

  return {
    blankVars,
    filledVars,
    valueChangedVars,
  }
}

function getTaskDocDescriptionComponent(taskDoc, fields) {
  const { blankVars, valueChangedVars } = analyzeTaskDocAndFields(taskDoc, fields);
  const readyToGen = blankVars.length === 0;
  if (taskDoc.fileId) {
    // Has gen doc
    if (!isEmpty(valueChangedVars)) {
      return <Alert type="warning"
        showIcon
        size="small"
        message="Some dependency field values have changed after previous generation. Regenerate with the latest field values?"
        description={<>
          {Object.entries(valueChangedVars).map(([varName, diff]) => (<Space size="small" key={varName}>
            <Text>{varName}</Text>
            <Text code>{diff.valueInDoc}</Text><ArrowRightOutlined /><Text code>{diff.valueInField}</Text>
          </Space>))}
        </>}
      />
    }
  } else {
    // Not gen doc yet
    if (readyToGen) {
      return <>All dependency fields are filled. Ready to generate doc.</>
    } else {
      return <>
        <Text type="warning">Below dependency field are blank. Fill them in before so as to generate the doc.</Text>
        {blankVars.map(varName => <Tag key={varName}>{varName}</Tag>)}
      </>
    }
  }

  return null;
}

export const TaskDocDescription = props => {
  const { taskDoc } = props;

  const { fileId, signedAt, signRequestedAt } = taskDoc
  const { task } = React.useContext(TaskContext);

  const hasFile = !!fileId;
  const descriptionComponent = React.useMemo(() => {
    if (signedAt) {
      return 'client has signed'
    } else if (signRequestedAt) {
      return 'awaiting client to sign'
    } else if (!hasFile) {
      return getTaskDocDescriptionComponent(taskDoc, task?.fields);
    } else {
      return getTaskDocDescriptionComponent(taskDoc, task?.fields);
    }
  }, [taskDoc, task]);

  return <ContainerText type="secondary">
    {descriptionComponent}
  </ContainerText>
}

TaskDocDescription.propTypes = {
  taskDoc: PropTypes.shape({
    fileId: PropTypes.string,
    demplateId: PropTypes.string,
    name: PropTypes.string.isRequired,
  }),
};

TaskDocDescription.defaultProps = {
};
