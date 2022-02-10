import React from 'react';
import PropTypes from 'prop-types';
import { switchMapTo } from 'rxjs/operators';
import { listTaskTags$, saveTaskTag$, subscribeTaskTags } from 'services/taskTagService';
import TagSelect from './TagSelect';


export const TaskTagSelect = React.memo((props) => {

  const { value: propValues, onChange,readonly, allowCreate, ...others } = props;

  const [tags, setTags] = React.useState();
  const [value, setValue] = React.useState(propValues);

  React.useEffect(() => {
    const sub$ = subscribeTaskTags(setTags);
    return () => sub$.unsubscribe()
  }, [])

  const handleCreateNewTag = tag => {
    saveTaskTag$(tag).pipe(
      switchMapTo(listTaskTags$()),
    ).subscribe();
  }

  const handleChange = (ids) => {
    setValue(ids);
    onChange(ids);
  }

  return (
    <div {...others}>
      <TagSelect 
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

TaskTagSelect.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  readonly: PropTypes.bool,
  allowCreate: PropTypes.bool,
  onChange: PropTypes.func,
};

TaskTagSelect.defaultProps = {
  readonly: false,
  allowCreate: true,
  onChange: () => { }
};

