import React from 'react';
import PropTypes from 'prop-types';
import Highlighter from "react-highlight-words";

const HighlightingText = (props) => {

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
  search: PropTypes.string.isRequired,
  value: PropTypes.string
};

HighlightingText.defaultProps = {
};

export default HighlightingText;
