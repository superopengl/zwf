import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown, Typography } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { TaskTemplateIcon, DocTemplateIcon } from './entityIcon';
import { CreateTaskModal } from 'components/CreateTaskModal';
import { useNavigate } from 'react-router-dom';
import { useKeys } from "rooks";

export const CreateNewButton = React.memo(props => {
  const { size } = props;
  const [modalVisible, setModalVisible] = React.useState(false)
  const navigate = useNavigate();

  const handleMenuSelected = (e) => {
    switch (e.key) {
      case 'task_template':
        navigate('/task_template/new')
        break;
      case 'doc_template':
        navigate('/doc_template/new')
        break;
      default:
        throw new Error(`Unknonw command '${e.key}'`)
    }
  }

  const handleCreateTask = () => {
    setModalVisible(true)
  }

  useKeys(["Alt", "KeyN"], () => {
    handleCreateTask();
  })

  const menu = {
    items: [{
      key: 'task_template',
      label: <><TaskTemplateIcon />Create Task Template</>
    },{
      key: 'doc_template',
      label: <><DocTemplateIcon />Create Doc Template</>
    }],
    onClick: handleMenuSelected,
    size,
  }

  return <>
    <Dropdown.Button
      menu={menu}
      size={size}
      onClick={handleCreateTask}
      trigger="click"
      type="primary"
      icon={<CaretDownOutlined />}
      style={{ width: 196 }}
    >
      Create Task (Alt + N)
    </Dropdown.Button>
    <CreateTaskModal visible={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => setModalVisible(false)} />
  </>
});

CreateNewButton.propTypes = {
  size: PropTypes.oneOf(['small', 'middle', 'large'])
};

CreateNewButton.defaultProps = {
  size: 'middle'
};

