import React from 'react';
import PropTypes from 'prop-types';
import Highlighter from "react-highlight-words";

export const HighlightingText = (props) => {

  const { search, value } = props;

  return (
    <Highlighter 
    highlightClassName="search-highlighting" 
    searchWords={[search]} 
    autoEscape={true} 
    textToHighlight={value || ''} 
    />
  );
};

HighlightingText.propTypes = {
  // value: PropTypes.string.isRequired,
  search: PropTypes.string,
  value: PropTypes.string
};

HighlightingText.defaultProps = {
  search: '',
};

