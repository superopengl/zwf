import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown, Typography } from 'antd';
import Icon, { CaretDownOutlined } from '@ant-design/icons';
import { TaskTemplateIcon, DocTemplateIcon } from './entityIcon';
import { useNavigate } from 'react-router-dom';
import { useKeys } from "rooks";
import { MdDashboardCustomize } from 'react-icons/md';
import { useCreateTaskModal } from 'hooks/useCreateTaskModal';

export const CreateNewButton = React.memo(props => {
  const { size } = props;
  const navigate = useNavigate();
  const [openCreator, creatorContextHolder] = useCreateTaskModal();

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
    openCreator()

  }

  // useKeys(["Alt", "KeyN"], () => {
  //   handleCreateTask();
  // })

  const menu = {
    items: [{
      key: 'task_template',
      label: <><TaskTemplateIcon />New Form Template</>
    },{
      key: 'doc_template',
      label: <><DocTemplateIcon />New Doc Template</>
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
      // style={{ width: 196 }}
    >
      <Icon component={MdDashboardCustomize} /> New Task 
    </Dropdown.Button>
    {creatorContextHolder}
  </>
});

CreateNewButton.propTypes = {
  size: PropTypes.oneOf(['small', 'middle', 'large'])
};

CreateNewButton.defaultProps = {
  size: 'middle'
};

