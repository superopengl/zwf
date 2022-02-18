import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown, Typography } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { TaskTemplateIcon, DocTemplateIcon } from './entityIcon';
import { showCreateTaskModal } from 'components/showCreateTaskModal';
import { notify } from 'util/notify';
import { withRouter, Link } from 'react-router-dom';

const {Link: TextLink} = Typography;

export const CreateNewButton = React.memo(withRouter(props => {
  const { size } = props;

  const handleMenuSelected = (e) => {
    switch (e.key) {
      case 'task_template':
        props.history.push('/task_template/new')
        break;
      case 'doc_template':
        props.history.push('/doc_template/new')
        break;
      default:
        throw new Error(`Unknonw command '${e.key}'`)
    }
  }

  const handleCreateTask = () => {
    showCreateTaskModal(null);
  }

  const menu = <Menu onClick={handleMenuSelected} size={size}>
    <Menu.Item key="task_template"><TaskTemplateIcon />Create Task Template</Menu.Item>
    <Menu.Item key="doc_template"><DocTemplateIcon />Create Doc Template</Menu.Item>
  </Menu>

  return <Dropdown.Button
    overlay={menu}
    size={size}
    onClick={handleCreateTask}
    trigger="click"
    type="primary"
    icon={<CaretDownOutlined/>}
    style={{width: 196}}
  >
    Create Task
  </Dropdown.Button>
}));

CreateNewButton.propTypes = {
  siza: PropTypes.oneOf(['small', 'middle', 'large'])
};

CreateNewButton.defaultProps = {
  size: 'middle'
};

