import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Typography, Tag, Space, Alert, Button } from 'antd';
import { TaskContext } from 'contexts/TaskContext';
import Icon, { ArrowLeftOutlined, ArrowRightOutlined, ExclamationCircleFilled, LeftOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';
import { BsArrowRightShort } from 'react-icons/bs';

const { Text, Paragraph } = Typography;

const Container = styled.div`
margin-left: 36px;
positon: relative:
top: -10px;

&, .ant-typography, .ant-tag, .ant-alert-message, .ant-alert-description, .ant-btn-sm {
  font-size: 12px;
}

.ant-alert {
  padding: 8px;

  .anticon {
    font-size: 16px;
  }
}
`;

const OnceButton = props => {
  const {onClick, children, ...others} = props;
  const [loading, setLoading] = React.useState(false);

  const handleClick = (e) => {
    setLoading(true);
    onClick(e);
  }

  return <Button {...others} onClick={handleClick} loading={loading}>{children}</Button>
}

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

function getTaskDocDescriptionComponent(taskDoc, fields, onGenDoc) {
  const { blankVars, valueChangedVars } = analyzeTaskDocAndFields(taskDoc, fields);
  const readyToGen = blankVars.length === 0;
  if (taskDoc.fileId) {
    // Has gen doc
    if (!isEmpty(valueChangedVars)) {
      return <Alert type="warning"
        showIcon
        icon={<ExclamationCircleFilled />}
        message="There have been changes in the values of certain dependency fields since the last generation. Regenerate the document with the latest field values?"
        action={<OnceButton size="small" onClick={onGenDoc}>Re-generate doc</OnceButton>}
        description={<>
          {Object.entries(valueChangedVars).map(([varName, diff]) => (<div key={varName}>
            <Space size="small" >
              <Text strong>{varName} : </Text>
              <Text code>{diff.valueInDoc}</Text>
              <Text type="secondary"><Icon component={BsArrowRightShort} /></Text>
              <Text code>{diff.valueInField}</Text>
            </Space>
          </div>))}
        </>}
      />
    }
  } else {
    // Not gen doc yet
    if (readyToGen) {
      return <><Alert type="success"
        showIcon
        description={'All mandatory fields have been completed. Document generation can now proceed.'}
        action={<OnceButton size="small" onClick={onGenDoc}>Generate doc</OnceButton>}
      />
      </>
    } else {
      return <>
        <Alert type="warning"
          showIcon
          icon={<ExclamationCircleFilled />}
          message="The following dependency fields are empty. Please fill them in before proceeding with document generation."
          description={<>
            {blankVars.map(varName => <div key={varName} >
              <Text code>{varName}</Text>
            </div>)}
          </>}
        />
      </>
    }
  }

  return null;
}

export const TaskDocDescription = props => {
  const { taskDoc, onGenDoc } = props;

  const { fileId, signedAt, signRequestedAt } = taskDoc
  const { task } = React.useContext(TaskContext);

  const hasFile = !!fileId;
  const descriptionComponent = React.useMemo(() => {
    if (signedAt) {
      return <Text type="secondary">Client has signed</Text>
    } else if (signRequestedAt) {
      return <Text type="secondary">Awaiting client to sign</Text>
    } else if (!hasFile) {
      return getTaskDocDescriptionComponent(taskDoc, task?.fields, onGenDoc);
    } else {
      return getTaskDocDescriptionComponent(taskDoc, task?.fields, onGenDoc);
    }
  }, [taskDoc, task, onGenDoc]);

  return <Container>
    {descriptionComponent}
  </Container>
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
