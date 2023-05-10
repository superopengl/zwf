import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Menu, Button } from 'antd';
import styled from 'styled-components';
import { CaretDownOutlined, SettingOutlined } from '@ant-design/icons';

const DropdownMenu = (props) => {
  const { config } = props;

  const handleMenuClick = (e) => {
    const {key} = e;
    const item = config[key];
    item?.onClick();
  }

  const menu = <Menu onClick={handleMenuClick}>
    {config.map((x, i) => <Menu.Item key={i} icon={x.icon}>
      {x.menu}
    </Menu.Item>)}
  </Menu>

  return (
    <Dropdown
      overlay={menu}
    >
      <Button icon={<SettingOutlined />} style={{paddingLeft: 8, paddingRight: 8}}>
        <CaretDownOutlined />
      </Button>
    </Dropdown>
  );
};

DropdownMenu.propTypes = {
  config: PropTypes.array.isRequired,
};

DropdownMenu.defaultProps = {
};

export default DropdownMenu;
