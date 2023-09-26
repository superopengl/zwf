import React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import styled from 'styled-components';
import { getPublicFileUrl } from 'services/fileService';
import { Typography, Avatar } from 'antd';

const StyledAvatar = styled(Avatar)`
img {
  object-fit: contain;
}
`;

export const OrgAvatar = React.memo((props) => {
  const { orgName, orgLogoFileId } = props;

  return orgLogoFileId ?
    <StyledAvatar shape="square" src={getPublicFileUrl(orgLogoFileId)} /> :
    <StyledAvatar shape="square">{orgName}</StyledAvatar>
});

OrgAvatar.propTypes = {
  orgName: PropTypes.string.isRequired,
  orgLogoFileId: PropTypes.string,
};

OrgAvatar.defaultProps = {
};


