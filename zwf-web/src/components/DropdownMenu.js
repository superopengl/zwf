import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Menu, Button, Divider } from 'antd';
import styled from 'styled-components';
import { CaretDownOutlined, SettingOutlined } from '@ant-design/icons';

const StyledDropdown = styled(Dropdown)`
.ant-dropdown-menu-item:hover {
  background-color: #0FBFC4 !important;
}
`

const DropdownMenu = (props) => {
  const { config, disabled } = props;

  const handleMenuClick = (e) => {
    const { key, domEvent } = e;
    domEvent.stopPropagation();
    const item = config[key];
    item?.onClick();
  }

  const items = config.map((x, i) => {
    if (x.menu === '-') {
      return <Divider key={i} />
    }
    return {
      key: i,
      icon: x.icon,
      label: x.menu
    }
  })

  return (
    <StyledDropdown
      disabled={disabled}
      menu={{items, onClick: handleMenuClick}}
      placement="bottomRight"
      trigger="click"
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
