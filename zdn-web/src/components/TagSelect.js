import React from 'react';
import PropTypes from 'prop-types';
import { Tag as AntdTag } from 'antd';
import Tag from './Tag';
import CreatableSelect from 'react-select/creatable';
import { v4 as uuidv4 } from 'uuid';


const Option = props => {
  const { data, innerProps } = props;
  return <div {...innerProps} style={{ padding: 6 }}>
    {data.color2 ? <Tag color={data.color}>{data.label}</Tag> : data.label}
  </div>;
}


const colourStyles = {
  // control: styles => ({ ...styles, backgroundColor: 'white' }),
  // option: (styles, { data, isDisabled, isFocused, isSelected }) => {
  //   const color = chroma(data.color);
  //   return {
  //     ...styles,
  //     backgroundColor: isDisabled
  //       ? null
  //       : isSelected
  //         ? data.color
  //         : isFocused
  //           ? color.alpha(0.1).css()
  //           : null,
  //     color: isDisabled
  //       ? '#ccc'
  //       : isSelected
  //         ? chroma.contrast(color, 'white') > 2
  //           ? 'white'
  //           : 'black'
  //         : data.color,
  //     cursor: isDisabled ? 'not-allowed' : 'default',

  //     ':active': {
  //       ...styles[':active'],
  //       backgroundColor: !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()),
  //     },
  //   };
  // },
  // option: (styles) => {
  //   return {
  //     ...styles,
  //     width: '100%',
  //     margin: '6px 0',
  //     padding: 20,
  //     backgroundColor: 'red',
  //   }
  // },
  container: (styles) => {
    return {
      ...styles,
      minWidth: '180px'
    }
  },
  multiValue: (styles, { }) => {
    return {
      ...styles,
      // width: '100%',
      margin: '4px',
      // backgroundColor: data.color,
      // backgroundColor: data.color,
    };
  },
  multiValueLabel: (styles, { }) => ({
    ...styles,
    // width: '100%',
    // color: getFontColor(data.color),
    // backgroundColor: data.color,
    borderRadius: '4px 0 0 4px',
  }),
  multiValueRemove: (styles, { }) => {
    return {
      ...styles,
      // backgroundColor: data.color,
      borderRadius: '0 4px 4px 0',
      ':hover': {
        // backgroundColor: data.color, //color.alpha(0.5).css(),
        // color: 'white',
      },
    }
  },
};

function convertTagToOption(tag) {
  return {
    label: tag.name,
    value: tag.id,
  };
}

function convertTagsToOptions(tags) {
  return (tags || []).map(convertTagToOption);
}

const TagSelect = (props) => {

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

  const handleChange = async (newValue, actionMeta) => {
    switch (actionMeta.action) {
      case 'select-option':
      case 'remove-value':
        updateSelectedOptions(newValue || []);
        break;
      case 'create-option':
      default:
    }
  }

  const handleCreateNew = async (newTagName) => {
    const tagId = uuidv4();
    const newTag = {
      id: tagId,
      name: newTagName,
    };
    const newOption = convertTagToOption(newTag);
    try {
      setLoading(true);
      await onSave(newTag);
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
    return <>{selectedOptions.map((x, i) => <AntdTag key={i} color="#00293d">{x.label}</AntdTag>)}</>
  }

  return <CreatableSelect
    isMulti
    closeMenuOnSelect={false}
    components={{ Option }}
    isClearable={false}
    isSearchable={true}
    isLoading={loading}
    onChange={handleChange}
    onCreateOption={handleCreateNew}
    value={selectedOptions}
    styles={colourStyles}
    options={options}
  />

  // return (
  //   <SelectStyled
  //     mode="multiple"
  //     allowClear={false}
  //     style={{ minWidth: 200 }}
  //     onChange={handleChange}
  //     disabled={loading}
  //     value={selectedTags}
  //     labelInValue
  //   >
  //     {options.map((t, i) => <Select.Option key={t.id} value={t.id}>
  //       <StockTag color={t.color}>{t.name}</StockTag>
  //     </Select.Option>)}
  //   </SelectStyled>
  // );
};

TagSelect.propTypes = {
  // value: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.object),
  value: PropTypes.arrayOf(PropTypes.string),
  readonly: PropTypes.bool,
  onChange: PropTypes.func,
  onSave: PropTypes.func,
};

TagSelect.defaultProps = {
  value: [],
  readonly: false,
  onChange: () => { },
  onSave: () => { },
};

export default TagSelect;
