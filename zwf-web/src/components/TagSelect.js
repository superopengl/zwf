import React from 'react';
import PropTypes from 'prop-types';
import { Tag as AntdTag, Tooltip } from 'antd';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import { v4 as uuidv4 } from 'uuid';
import uniqolor from 'uniqolor';
import { getFontColor } from 'util/getFontColor';

const Option = props => {
  const { data, innerProps } = props;
  return <div {...innerProps} style={{ padding: 6 }}>
    {data.color ? <AntdTag color={data.color} style={{color: getFontColor(data.color)}}>{data.label}</AntdTag> : data.label}
  </div>;
}

const Input = (props) => {
  if (props.isHidden) {
    return <components.Input {...props} />;
  }
  return (
    <div style={{ border: `1px dotted #030303` }}>
      <Tooltip title={'Create new tag'}>
        <components.Input {...props} />
      </Tooltip>
    </div>
  );
};

const colourStyles = {
  control: styles => ({
    ...styles,
    backgroundColor: 'white',
    boxShadow: 'none',
    border: '1px solid rgb(217, 217, 217)',
    '&:hover': {
      border: '1px solid #b6d3de',
      boxShadow: '0 0 0 2px rgb(138 188 209 / 20%)',
      outline: 0,
    },
    '&:focus': {
      border: '1px solid #b6d3de',
      boxShadow: '0 0 0 2px rgb(138 188 209 / 20%)',
      outline: 0,
    }
  }),
  // option: (styles, { data, isDisabled, isFocused, isSelected }) => {
  //   const color = chroma(data.color);
  //   return {
  //     ...styles,
  //     backgroundColor: isDisabled
  //       ? undefined
  //       : isSelected
  //       ? data.color
  //       : isFocused
  //       ? color.alpha(0.1).css()
  //       : undefined,
  //     color: isDisabled
  //       ? '#ccc'
  //       : isSelected
  //       ? chroma.contrast(color, 'white') > 2
  //         ? 'white'
  //         : 'black'
  //       : data.color,
  //     cursor: isDisabled ? 'not-allowed' : 'default',

  //     ':active': {
  //       ...styles[':active'],
  //       backgroundColor: !isDisabled
  //         ? isSelected
  //           ? data.color
  //           : color.alpha(0.3).css()
  //         : undefined,
  //     },
  //   };
  // },
  container: (styles) => {
    return {
      ...styles,
      minWidth: '180px'
    }
  },
  multiValue: (styles, { data }) => {
    return {
      ...styles,
      color: getFontColor(data.color),
      backgroundColor: data.color,
    };
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    // width: '100%',
    color: getFontColor(data.color),
    backgroundColor: data.color,
    borderRadius: '4px 0 0 4px',
  }),
  multiValueRemove: (styles, { data }) => {
    return {
      ...styles,
      // color: data.color,
      borderRadius: '0 4px 4px 0',
      ':hover': {
        color: getFontColor(data.color),
        backgroundColor: data.color, //color.alpha(0.5).css(),
      },
    }
  },
};

function convertTagToOption(tag) {
  return {
    label: tag.name,
    value: tag.id,
    color: tag.colorHex,
  };
}

function convertTagsToOptions(tags) {
  return (tags || []).map(convertTagToOption);
}

const TagSelect = React.memo((props) => {

  const { value: selectedTagIds, readonly, onChange, tags, onSave } = props;
  const allOptions = convertTagsToOptions(tags);

  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState(allOptions);
  const initSelectedOptions = allOptions.filter(x => selectedTagIds?.some(tagId => tagId === x.value));
  const [selectedOptions, setSelectedOptions] = React.useState(initSelectedOptions);

  React.useEffect(() => {
    const allOptions = convertTagsToOptions(tags);
    setOptions(allOptions);
    const selectedOptions = allOptions.filter(x => selectedTagIds?.some(tagId => tagId === x.value));
    setSelectedOptions(selectedOptions);
  }, [tags]);

  React.useEffect(() => {
    if (!selectedTagIds || !selectedTagIds.length) {
      setSelectedOptions([]);
    } else {
      const selectedOptions = options.filter(x => selectedTagIds.some(tagId => tagId === x.value));
      setSelectedOptions(selectedOptions);
    }
  }, [selectedTagIds]);

  const handleChange = (newValue, actionMeta) => {
    switch (actionMeta.action) {
      case 'select-option':
      case 'remove-value':
        updateSelectedOptions(newValue || []);
        break;
      case 'create-option':
      default:
    }
  }

  const handleCreateNew = (newTagName) => {
    const tagId = uuidv4();
    const newTag = {
      id: tagId,
      name: newTagName,
      colorHex: uniqolor.random().color,
    };
    const newOption = convertTagToOption(newTag);
    try {
      setLoading(true);
      onSave(newTag);
      setOptions([...options, newOption]);
      updateSelectedOptions([...selectedOptions, newOption]);
    } finally {
      setLoading(false);
    }
  }

  const updateSelectedOptions = (newSelectedOptions) => {
    setSelectedOptions(newSelectedOptions);
    onChange(newSelectedOptions.map(x => x.value));
  }

  if (readonly) {
    return <>{selectedOptions.map((x, i) => <AntdTag key={i} color={x.color} style={{color: getFontColor(x.color)}}>{x.label}</AntdTag>)}</>
  }

  return <CreatableSelect
    isMulti
    closeMenuOnSelect={false}
    components={{ Option, Input }}
    isClearable={false}
    isSearchable={true}
    isLoading={loading}
    onChange={handleChange}
    onCreateOption={handleCreateNew}
    value={selectedOptions}
    styles={colourStyles}
    options={options}
  />
});

TagSelect.propTypes = {
  // value: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.object),
  value: PropTypes.arrayOf(PropTypes.string),
  readonly: PropTypes.bool,
  onChange: PropTypes.func,
  onSave: PropTypes.func,
};

TagSelect.defaultProps = {
  tags: [],
  value: [],
  readonly: false,
  onChange: (ids) => { },
  onSave: (tag) => { },
};

export default TagSelect;
