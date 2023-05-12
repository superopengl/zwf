import PropTypes from 'prop-types';
import { Typography } from 'antd';
import React from 'react';
import { createFormItemSchema, FemplateFieldControlDefMap } from 'util/FieldControlDef';
import { BetaSchemaForm, ProFormSelect } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import styled from 'styled-components';
import { EyeInvisibleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

const { Text } = Typography;

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

export const FieldItem = React.memo((props) => {
  const { field } = props;

  const fieldSchema = createFormItemSchema(field, 'agent');
  fieldSchema.fieldProps.disabled = true;

  return <Container>
    <BetaSchemaForm
      layoutType='Form'
      requiredMark="optional"
      columns={[fieldSchema]}
      submitter={{
        render: () => null
      }}
    />
  </Container>
})


FieldItem.propTypes = {
  field: PropTypes.object.isRequired,
};

FieldItem.defaultProps = {
};