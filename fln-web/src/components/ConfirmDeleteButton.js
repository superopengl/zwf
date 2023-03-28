
import React from 'react';
import { Popover, Button } from 'antd';
import PropTypes from 'prop-types';
import { CloseOutlined } from '@ant-design/icons';

export const ConfirmDeleteButton = (props) => {
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleVisibleChange = visible => {
    setVisible(visible);
  }

  const handleDelete = async () => {
    setLoading(true);
    await props.onOk();
    setVisible(false);
    setLoading(false);
  }

  return <Popover
    title={<>{props.message || 'Confirm'}</>}
    trigger="click"
    visible={visible}
    onVisibleChange={handleVisibleChange}
    content={<>
      <Button onClick={() => setVisible(false)} disabled={loading}>Cancel</Button>
      <Button style={{ marginLeft: 10 }}
        type="primary"
        {...props.okButtonProps}
        onClick={handleDelete}
        disabled={loading}>{props.okText || 'OK'}</Button>
    </>}
  >
    <Button type="link" danger icon={<CloseOutlined style={{ fontSize: '0.8rem' }} />} disabled={loading} />
  </Popover>
}

ConfirmDeleteButton.propTypes = {
  onOk: PropTypes.func.isRequired,
  okButtonProps: PropTypes.object,
  okText: PropTypes.string,
  message: PropTypes.any
};

ConfirmDeleteButton.defaultProps = {
  okButtonProps: {
    danger: true
  },
  okText: 'Yes, delete',
  message: 'Delete it?'
};
