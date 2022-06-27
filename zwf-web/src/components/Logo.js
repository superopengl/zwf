
import React from 'react';
import { Link } from 'react-router-dom';
import logoSvg from '../logo-blue.svg';
import {Image} from 'antd';

export const Logo = (props) =>
  <Link to="/">
    <Image src={logoSvg} alt="logo" preview={false} width={props.size || 80} />
  </Link>
