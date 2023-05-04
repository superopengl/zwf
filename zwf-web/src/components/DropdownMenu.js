import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Menu, Button, Divider } from 'antd';
import styled from 'styled-components';
import Icon, { CaretDownOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import {IoEllipsisHorizontal, IoEllipsisVertical} from 'react-icons/io5';

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

  const items = config.filter(x => !!x).map((x, i) => {
    if (x.menu === '-') {
      return {
        key: i,
        type: 'divider',
      }
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
      <Button type="text" icon={<Icon component={IoEllipsisVertical} />} onClick={e => e.stopPropagation()}>
        {/* <CaretDownOutlined /> */}
        {/* <EllipsisOutlined/> */}
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
