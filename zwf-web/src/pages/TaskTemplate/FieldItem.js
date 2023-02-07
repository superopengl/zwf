import PropTypes from 'prop-types';
import { Typography } from 'antd';
import React from 'react';
import { createFormItemSchema, TaskTemplateFieldControlDefMap } from 'util/TaskTemplateFieldControlDef';
import { BetaSchemaForm, ProFormSelect } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import styled from 'styled-components';
import {EyeInvisibleOutlined} from '@ant-design/icons';
import { Tooltip } from 'antd';

const {Text} = Typography;

const Container = styled.div`
position: relative;

.ant-form-item {
  margin-bottom: 0 !important;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
`;

export const FieldItem = (props) => {
  const { field } = props;

  const controlDef = TaskTemplateFieldControlDefMap.get(field.type);

  return <Container>
    {/* <BetaSchemaForm
      layoutType='Form'
      columns={[fieldSchema]}
      submitter={{
        render: () => null
      }}
    /> */}
    {/* <Field valueType="jsonCode" text={JSON.stringify(field)} /> */}
    {/* <Field valueType="jsonCode" text={JSON.stringify(fieldSchema)} /> */}
    <controlDef.control {...controlDef.fieldProps} placeholder={field.name} options={field.options} autoFocus={false}/>
    <Text type="secondary">{field.description}</Text>
    {/* <div className="mask"></div> */}
  </Container>

  // return <controlDef.control  {...fieldProps} {...otherProps} help={otherProps.description} />
}


FieldItem.propTypes = {
  field: PropTypes.object.isRequired,
};

FieldItem.defaultProps = {
};