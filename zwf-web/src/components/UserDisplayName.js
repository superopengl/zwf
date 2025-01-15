import { Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import {HighlightingText} from './HighlightingText';
import { getUserDisplayName } from '../util/getUserDisplayName';

const { Text } = Typography;

export const UserDisplayName = (props) => {
  const { email, givenName, surname, searchText, showEmail } = props;

  const displayName = React.useMemo(() => {
    return getUserDisplayName(email, givenName, surname);
  }, [
    email, givenName, surname
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>
        {/* <HighlightingText value={displayName} search={searchText} /> */}
        <Text ellipsis={true} style={{ maxWidth: "100%" }}>
          <HighlightingText value={displayName} search={searchText} />
          </Text>
      {showEmail && <Text ellipsis={true} style={{ margin: 0, lineHeight: '0.8rem',  maxWidth: '100%' }} type="secondary"><small>
        <HighlightingText value={email} search={searchText} />
      </small></Text>}
    </div>
  )
};

UserDisplayName.propTypes = {
  surname: PropTypes.string,
  givenName: PropTypes.string,
  email: PropTypes.string.isRequired,
  searchText: PropTypes.string,
  showEmail: PropTypes.bool,
};

UserDisplayName.defaultProps = {
  surname: null,
  givenName: null,
  searchText: '',
  showEmail: true,
};

