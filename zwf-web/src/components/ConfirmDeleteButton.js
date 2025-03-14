
import React from 'react';
import { Popover, Button, Typography } from 'antd';
import PropTypes from 'prop-types';
import { CloseOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

export const ConfirmDeleteButton = (props) => {
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleVisibleChange = visible => {
    setVisible(visible);
  }

  const handleDelete = async (e) => {
    setLoading(true);
    await props.onOk(e);
    setVisible(false);
    setLoading(false);
  }

  return <Popover
    title={ 'Confirm'}
    trigger="click"
    open={visible}
    onOpenChange={handleVisibleChange}
    content={<>
      <Paragraph>{props.message}</Paragraph>
      <Button type="text" onClick={() => setVisible(false)} disabled={loading}>Cancel</Button>
      <Button style={{ marginLeft: 10 }}
        type="text"
        {...props.okButtonProps}
        onClick={handleDelete}
        disabled={loading}>{props.okText || 'OK'}</Button>
    </>}
  >
    <Button type="text" danger icon={props.icon} disabled={loading}>{props.children}</Button>
  </Popover>
}

ConfirmDeleteButton.propTypes = {
  onOk: PropTypes.func.isRequired,
  okButtonProps: PropTypes.object,
  okText: PropTypes.string,
  icon: PropTypes.object,
  message: PropTypes.any
};

ConfirmDeleteButton.defaultProps = {
  okButtonProps: {
    danger: true,
    type: 'primary',
  },
  okText: 'Yes, delete',
  message: 'Delete it?'
};
