
import React from 'react';
import { Link } from 'react-router-dom';
import {Image} from 'antd';

export const Logo = (props) =>
  <Link to="/">
    <Image src="/images/logo.svg" alt="logo" preview={false} width={props.size || 60} />
  </Link>
