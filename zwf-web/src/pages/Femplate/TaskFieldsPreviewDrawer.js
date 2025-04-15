import React from 'react';
import { Drawer, Segmented, Radio } from 'antd';
import { TaskFieldsPreviewPanel } from './TaskFieldsPreviewPanel';
import PropTypes from 'prop-types';


export const TaskFieldsPreviewDrawer = props => {
  const {open, onClose, name, fields} = props;
  const [previewMode, setPreviewMode] = React.useState('agent');

  return (<Drawer
    title="Form Preview"
    closable
    open={open}
    onClose={onClose}
    destroyOnClose
    maskClosable
    width={500}
    extra={<Radio.Group
      buttonStyle="solid"
      optionType="button"
      defaultValue="agent"
      options={[{
        label: 'Agent',
        value: 'agent'
      }, {
        label: 'Client',
        value: 'client'
      }, {
        label: 'Profile',
        value: 'profile'
      }]}
      onChange={e => setPreviewMode(e.target.value)} />}
  >
    <TaskFieldsPreviewPanel
      name={name}
      fields={fields}
      mode={previewMode}
    />
  </Drawer>
  );
};

TaskFieldsPreviewDrawer.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  name: PropTypes.string,
  fields: PropTypes.array,
};

TaskFieldsPreviewDrawer.defaultProps = {
  open: false,
  onClose: () => {},
};

