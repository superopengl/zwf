import React from 'react';
import PropTypes from 'prop-types';
import Tag from './Tag';
import { groupBy } from 'lodash';

export const TagFilter = (props) => {

  const { onChange, tags, value, style } = props;
  const [selected, setSelected] = React.useState(value);

  const isSelected = (tag) => {
    return selected.includes(tag.id);
  }

  const toggleSelected = (tag) => {
    let newSelected;
    if (isSelected(tag)) {
      newSelected = [...selected.filter(x => x !== tag.id)];
    } else {
      newSelected = [...selected, tag.id];
    }
    setSelected(newSelected);
    onChange(newSelected);
  }

  if (!tags?.length) {
    return null;
  }


  return (
    <div style={style}>
      {tags.map((t, i) => <Tag
        key={i}
        color={t.color}
        clickable={true}
        style={{ marginBottom: 10 }}
        checked={isSelected(t)}
        onClick={() => toggleSelected(t)}
      >
        {t.name}
      </Tag>)}
    </div>
  );
};

TagFilter.propTypes = {
  // value: PropTypes.string.isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func,
  tags: PropTypes.arrayOf(PropTypes.object),
  group: PropTypes.bool,
};

TagFilter.defaultProps = {
  value: [],
  tags: [],
  onChange: () => { },
  group: false
};

export default TagFilter;
