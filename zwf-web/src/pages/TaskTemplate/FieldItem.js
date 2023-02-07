import PropTypes from 'prop-types';
import { Typography } from 'antd';
import React from 'react';
import { TaskTemplateFieldControlDef } from 'util/TaskTemplateFieldControlDef';


const controlMap = new Map(TaskTemplateFieldControlDef.map(x => [x.type, x]));

export const FieldItem = (props) => {
  const { type, ...otherProps } = props;

  const controlDef = controlMap.get(type);

  if(!controlDef) {
    throw new Error(`Unknown control type ${type}`);
  }

  const Element = controlDef.control;
  const fieldProps = controlDef.fieldProps;

  return <Element  {...fieldProps} {...otherProps} />
}


FieldItem.propTypes = {
  type: PropTypes.string.isRequired,
};

FieldItem.defaultProps = {
};