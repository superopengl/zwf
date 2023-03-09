import { Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { HighlightingText } from './HighlightingText';
import { getUserDisplayName } from '../util/getUserDisplayName';
import styled from 'styled-components';

const Container = styled.div`
display: flex;
flex-direction: column;
`;

const { Text, Link: TextLink } = Typography;

export const UserDisplayName = (props) => {
  const { email, size, givenName, surname, searchText, showEmail, type } = props;

  const displayName = React.useMemo(() => {
    return getUserDisplayName(email, givenName, surname);
  }, [
    email, givenName, surname
  ]);

  const Element = type === 'link' ? TextLink : Text;

  return (
    <Container>
      <Element ellipsis={true} style={{ maxWidth: "100%", fontSize: size }} type={type}>
        <HighlightingText value={displayName} search={searchText} />
      </Element>
      {showEmail && <Element ellipsis={true} style={{ margin: 0, lineHeight: 1.1, maxWidth: '100%', fontSize: size }} type={type || "secondary"}><small>
        <HighlightingText value={email} search={searchText} />
      </small></Element>}
    </Container>
  )
};

UserDisplayName.propTypes = {
  surname: PropTypes.string,
  givenName: PropTypes.string,
  email: PropTypes.string.isRequired,
  searchText: PropTypes.string,
  showEmail: PropTypes.bool,
  size: PropTypes.number,
  type: PropTypes.oneOf(['link']),
};

UserDisplayName.defaultProps = {
  surname: null,
  givenName: null,
  searchText: '',
  showEmail: true,
  size: 32,
};

