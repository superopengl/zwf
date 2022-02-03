import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Menu, Dropdown, Button } from 'antd';
import { CaretDownOutlined, DownOutlined } from '@ant-design/icons';
import { TaskIcon, TaskTemplateIcon, DocTemplateIcon } from './entityIcon';
import { showCreateTaskModal } from 'components/showCreateTaskModal';
import { notify } from 'util/notify';
import { withRouter } from 'react-router-dom';

const { Text, Paragraph, Link: TextLink } = Typography;

export const CreateNewButton = withRouter(props => {
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
    showCreateTaskModal(null, () => {
      notify.info('Task created', <>blah</>);
    });
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
});

CreateNewButton.propTypes = {
  siza: PropTypes.oneOf(['small', 'middle', 'large'])
};

CreateNewButton.defaultProps = {
  size: 'middle'
};

