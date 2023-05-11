import { Button, Row, Col, Input, Typography, Modal } from 'antd';
import React from 'react';
import { CloseOutlined, MinusCircleOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
const { Text } = Typography

export const DemplateRenameFieldInput = (props) => {
  const { value: propValue, onChange, onDelete } = props;

  const [deleteVisible, setDeleteVisible] = React.useState(true);
  const [value, setValue] = React.useState(propValue);
  const [modal, contextHolder] = Modal.useModal();

  React.useEffect(() => {
    setValue(propValue);
  }, [propValue]);

  const handleRename = (newValue) => {
    setDeleteVisible(true);
    const oldName = propValue?.trim();
    const newName = newValue.trim();
    if (oldName !== newName) {
      onChange(newName);
    }
  }

  const handleDelete = () => {
    modal.confirm({
      title: <>Delete field <Text code>{propValue}</Text>?</>,
      content: <>This action will delete all the places of using field notation <Text code>{'{{'}{propValue}{'}}'}</Text>.</>,
      closable: true,
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete',
      cancelButtonProps: {
        type: 'text'
      },
      onOk: onDelete,
    })
  }

  return <Row justify="space-between" gutter={2} style={{width: '100%'}}>
    <Col flex="auto">
      <Input defaultValue={propValue?.trim()}
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setDeleteVisible(false)}
        onBlur={e => handleRename(e.target.value)} />
    </Col>
    <Col>
      <Button type="text" icon={<MinusCircleOutlined />} onClick={handleDelete} style={{display: deleteVisible ? undefined : 'none'}}/>
      {contextHolder}
    </Col>
  </Row>

};

DemplateRenameFieldInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

DemplateRenameFieldInput.defaultProps = {};

export default DemplateRenameFieldInput;
