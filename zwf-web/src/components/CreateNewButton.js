import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown, Typography } from 'antd';
import Icon, { CaretDownOutlined } from '@ant-design/icons';
import { FemplateIcon, DocTemplateIcon } from './entityIcon';
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
      case 'femplate':
        navigate('/femplate/new')
        break;
      case 'demplate':
        navigate('/demplate/new')
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
      key: 'femplate',
      label: <><FemplateIcon />New Form Template</>
    },{
      key: 'demplate',
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

