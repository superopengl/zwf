import React from 'react';
import PropTypes from 'prop-types';
import { switchMapTo } from 'rxjs/operators';
import { listTags$, saveTag$, subscribeTags } from 'services/tagService';
import { TagSelectComponent } from './TagSelectComponent';
import { useOutsideClick } from "rooks";

export const TagSelect = React.memo((props) => {

  const { value: propValues, onChange, readonly: propReadonly, allowCreate, inPlaceEdit, ...others } = props;

  const [tags, setTags] = React.useState();
  const [value, setValue] = React.useState(propValues);
  const [readonly, setReadonly] = React.useState(propReadonly || inPlaceEdit);
  const ref = React.useRef();
  useOutsideClick(ref, () => {
    if(inPlaceEdit) {
      setReadonly(true);
    }
  })

  React.useEffect(() => {
    const sub$ = subscribeTags(setTags);
    return () => sub$.unsubscribe()
  }, [])

  const handleCreateNewTag = tag => {
    saveTag$(tag).pipe(
      switchMapTo(listTags$()),
    ).subscribe();
  }

  const handleChange = (ids) => {
    setValue(ids);
    onChange(ids);
  }

  const handleFocus = () => {
    if(inPlaceEdit) {
      setReadonly(false);
    }
  }

  return (
    <div {...others} ref={ref} onClick={handleFocus}>
      <TagSelectComponent
        value={value}
        onChange={handleChange}
        readonly={readonly}
        onSave={handleCreateNewTag}
        tags={tags}
        allowCreate={allowCreate}
      />
    </div>
    // <StyledSelect
    //   {...others}
    //   style={{ minWidth: 30, width: '100%' }}
    //   value={value}
    //   mode="tags"
    //   options={options}
    //   // tagRender={item => {
    //   //   return <Tag key={item.id} color={item.colorHex}>{item.name}</Tag>
    //   // }}
    //   // dropdownRender={item => <Tag key={item.id} color={item.colorHex}>{item.name}</Tag>}
    //   onChange={handleChange}
    // // onSearch={handleSearch}
    // >
    //   {/* {allTags.map(item => <Select.Option key={item.id} value={item.id}>
    //     <Tag color={item.colorHex}>{item.name}</Tag>
    //   </Select.Option>)} */}
    // </StyledSelect>
  );
});

TagSelect.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  readonly: PropTypes.bool,
  allowCreate: PropTypes.bool,
  onChange: PropTypes.func,
  inPlaceEdit: PropTypes.bool,
};

TagSelect.defaultProps = {
  readonly: false,
  allowCreate: true,
  onChange: () => { },
  inPlaceEdit: false,
};

