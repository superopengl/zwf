import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Menu, Button } from 'antd';
import styled from 'styled-components';
import { CaretDownOutlined, SettingOutlined } from '@ant-design/icons';

const StyledDropdown = styled(Dropdown)`
.ant-dropdown-menu-item:hover {
  background-color: #37AFD2 !important;
}
`

const DropdownMenu = (props) => {
  const { config } = props;

  const handleMenuClick = (e) => {
    const { key, domEvent } = e;
    domEvent.stopPropagation();
    const item = config[key];
    item?.onClick();
  }

  const menu = <Menu
    mode="vertical"
    // theme="dark"
    onClick={handleMenuClick}>
    {config.map((x, i) => {
      if(x.menu === '-') {
        return <Menu.Divider key={i} />
      }
    return <Menu.Item key={i} icon={x.icon} disabled={x.disabled} >
      {x.menu}
    </Menu.Item>})}
  </Menu>

  return (
    <StyledDropdown
      overlay={menu}
      placement="bottomRight"
      trigger="click"
      onClick={e => e.stopPropagation()}
    >
      <Button icon={<SettingOutlined />} style={{ paddingLeft: 8, paddingRight: 8 }}>
        <CaretDownOutlined />
      </Button>
    </StyledDropdown>
  );
};

DropdownMenu.propTypes = {
  config: PropTypes.array.isRequired,
};

DropdownMenu.defaultProps = {
};

export default DropdownMenu;
